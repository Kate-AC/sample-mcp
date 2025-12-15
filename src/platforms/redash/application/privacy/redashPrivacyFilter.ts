import {
  PrivacyFilter,
  PrivacyFilterList,
  maskEmail,
  maskName,
  maskPhone,
} from "@core/contracts/privacy/privacyFilter";
import {
  RedashExecuteSqlPayload,
  RedashQueryPayload,
} from "../../domain/repositories/redashRepositoryPayload";

export interface RedashPrivacyFilterList extends PrivacyFilterList {
  query: PrivacyFilter<RedashQueryPayload>;
  executeSql: PrivacyFilter<RedashExecuteSqlPayload>;
}

/**
 * 個人情報を含む可能性のあるカラム名のパターン
 * カラム名がこれらのパターンにマッチする場合、自動的にマスキングされます
 */
const PII_COLUMN_PATTERNS: RegExp[] = [
  /^email$/i,
  /^.*_email$/i,
  /^mail$/i,
  /^.*_mail$/i,
  /^phone$/i,
  /^.*_phone$/i,
  /^tel$/i,
  /^.*_tel$/i,
  /^address$/i,
  /^.*_address$/i,
  /^addr\d*$/i,
  /^zip$/i,
  /^.*_zip$/i,
  /^ken$/i,
  /^.*_ken$/i,
  /^prefecture$/i,
  /^.*_prefecture$/i,
  /^birthday$/i,
  /^.*_birthday$/i,
  /^credit_card.*$/i,
  /^password$/i,
  /^.*_password$/i,
  /^token$/i,
  /^.*_token$/i,
];

/**
 * カラム名が個人情報を含む可能性があるかチェック
 */
const shouldMaskColumn = (columnName: string): boolean => {
  return PII_COLUMN_PATTERNS.some((pattern) => pattern.test(columnName));
};

/**
 * 値のパターンから個人情報かどうかを判定してマスキング
 */
const maskValueIfPii = (value: any): any => {
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") return value;

  // メールアドレスパターン
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return maskEmail(value);
  }

  // 電話番号パターン（日本形式）
  if (/^\d{2,4}-\d{2,4}-\d{4}$/.test(value)) {
    return maskPhone(value);
  }

  return value;
};

export const makeRedashPrivacyFilterList = (
  maskPii = true,
): RedashPrivacyFilterList => ({
  query: (result) => {
    if (!maskPii) return result;

    return {
      ...result,
      payload: {
        ...result.payload,
        // ユーザー情報をマスキング
        user: {
          ...result.payload.user,
          name: maskName(result.payload.user.name),
          email: maskEmail(result.payload.user.email),
        },
      },
    };
  },

  executeSql: (result) => {
    if (!maskPii) return result;

    const columns = result.payload.columns;
    const rows = result.payload.rows;

    // カラム名ベースで個人情報を含む可能性があるカラムを特定
    const piiColumnIndexes = columns
      .map((col, index) => ({
        index,
        shouldMask: shouldMaskColumn(col.name),
      }))
      .filter((col) => col.shouldMask)
      .map((col) => col.index);

    // 個人情報カラムがない場合はそのまま返す
    if (piiColumnIndexes.length === 0) {
      return result;
    }

    // 各行のPIIカラムをマスキング
    const maskedRows = rows.map((row) => {
      const maskedRow = { ...row };

      piiColumnIndexes.forEach((colIndex) => {
        const columnName = columns[colIndex]!.name;
        const value = row[columnName];

        if (value === null || value === undefined) {
          return;
        }

        // カラム名に基づいてマスキング方法を選択
        if (/email|mail/i.test(columnName)) {
          maskedRow[columnName] =
            typeof value === "string" ? maskEmail(value) : "[MASKED]";
        } else if (/phone|tel/i.test(columnName)) {
          maskedRow[columnName] =
            typeof value === "string" ? maskPhone(value) : "[MASKED]";
        } else if (/zip|ken|prefecture|addr/i.test(columnName)) {
          maskedRow[columnName] =
            typeof value === "string" ? maskName(value) : "[MASKED]";
        } else {
          // その他は値のパターンでチェック
          maskedRow[columnName] = maskValueIfPii(value);
        }
      });

      return maskedRow;
    });

    return {
      ...result,
      payload: {
        ...result.payload,
        rows: maskedRows,
      },
    };
  },
});
