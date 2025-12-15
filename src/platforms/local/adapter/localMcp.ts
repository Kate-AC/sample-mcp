import { Mcp } from "@core/contracts/mcp/mcp";
import { McpFunction } from "@core/contracts/mcp/mcpFunction";
import {
  LocalFindDirsByNamePayload,
  LocalListPayload,
  LocalReadPayload,
  LocalSearchByNamePayload,
  LocalSearchCodePayload,
} from "../domain/repositories/localRepositoryPayload";
import { makeLocalRepository } from "../infrastructure/repositories/localRepository";
import { makeLocalMcpMetadata } from "./localMcpMetadata";
import { makeLocalMcpSetting } from "./localMcpSetting";

type LocalMcpFunctions = {
  readFile: McpFunction<LocalReadPayload, [string]>;
  listFiles: McpFunction<LocalListPayload, [string, boolean?]>;
  searchFilesByName: McpFunction<LocalSearchByNamePayload, [string, string?]>;
  searchCode: McpFunction<
    LocalSearchCodePayload,
    [string, string?, string?, number?]
  >;
  findDirsByName: McpFunction<LocalFindDirsByNamePayload, [string[], string?]>;
};

export const makeLocalMcp = ({
  repository = makeLocalRepository(),
} = {}): Mcp<LocalMcpFunctions> => {
  return {
    mcpFunctions: {
      readFile: async (filePath: string) => {
        return repository.readFile(filePath);
      },
      listFiles: async (dirPath: string, recursive?: boolean) => {
        return repository.listFiles(dirPath, recursive);
      },
      searchFilesByName: async (pattern: string, rootPath?: string) => {
        return repository.searchFilesByName(pattern, rootPath);
      },
      searchCode: async (
        pattern: string,
        rootPath?: string,
        filePattern?: string,
        contextLines?: number,
      ) => {
        return repository.searchCode(
          pattern,
          rootPath,
          filePattern,
          contextLines,
        );
      },
      findDirsByName: async (names: string[], rootPath?: string) => {
        return repository.findDirsByName(names, rootPath);
      },
    },
    mcpMetadata: makeLocalMcpMetadata(),
    mcpSetting: makeLocalMcpSetting(),
  };
};
