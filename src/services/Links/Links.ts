import { endpointsConfig } from '../../config';
import { createEnhancedClient } from '../../utils';
import { parseAxiosError } from '../utils';
import type { UrlInfo } from '../../types';
import type { UrlInfoResponse } from './types';
import type { AxiosInstance } from 'axios';

const { apiURL } = endpointsConfig;

class LinksService {
  private axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = createEnhancedClient({
      baseURL: `${apiURL}/api/links`,
      withCredentials: true,
    });
  }

  public async getOwnShortUrls(): Promise<UrlInfo[]> {
    try {
      const resp = await this.axiosClient.get<UrlInfoResponse[]>('/getUrls');
      const urlsInfo: UrlInfo[] = resp.data.map((urlInfo) => {
        const { id, fullUrl: responseFullUrl, linkId, views, createdAt } = urlInfo;

        return {
          id,
          fullUrl: responseFullUrl,
          linkId,
          views,
          createdAt: new Date(createdAt),
        };
      });

      return urlsInfo;
    } catch (error: any) {
      const GET_SHORT_URLS_ERROR_CODES_TRANSLATION = {
        FAILED_TO_RETRIVE_LINK_INFO: 'Failed to retrive short links info.',
        BAD_TOKEN_ERROR: 'Auth error, try to login / re-login.',
      };

      return parseAxiosError(error, GET_SHORT_URLS_ERROR_CODES_TRANSLATION);
    }
  }

  public async createShortUrl(fullUrl: string, linkName?: string): Promise<UrlInfo> {
    try {
      const createBody = {
        fullUrl,
        linkName: linkName ? linkName : undefined,
      };
      const resp = await this.axiosClient.post<UrlInfoResponse>('/createShortUrl', createBody);
      const { id, fullUrl: responseFullUrl, linkId, views, createdAt } = resp.data;

      return {
        id,
        fullUrl: responseFullUrl,
        linkId,
        views,
        createdAt: new Date(createdAt),
      };
    } catch (error: any) {
      const CREATE_SHORT_URL_ERROR_CODES_TRANSLATION = {
        FAILED_TO_RETRIVE_LINK_INFO: 'Failed to retrive short links info.',
        BAD_TOKEN_ERROR: 'Auth error, try to login / re-login.',
        URL_CREATE_VALIDATION_ERROR: 'Bad url creation parameters, enter valid parameters.',
        URL_CREATE_ALREADY_EXIST_ERROR: 'Custom ending already exists.',
        URL_CREATE_ERROR: 'Failed to create short url, try again later.',
      };

      return parseAxiosError(error, CREATE_SHORT_URL_ERROR_CODES_TRANSLATION);
    }
  }

  public async renameShortUrl(id: string, linkName: string): Promise<void> {
    try {
      await this.axiosClient.post<'Ok'>('/renameShortUrl', { id, linkName });
    } catch (error: any) {
      const RENAME_SHORT_URL_ERROR_CODES_TRANSLATION = {
        BAD_TOKEN_ERROR: 'Auth error, try to login / re-login.',
        URL_RENAME_ERROR: "Can't rename this url, try again later or contact support.",
        URL_RENAME_ALREADY_EXIST_ERROR: `Can't rename to: ${linkName}, because this name is already used`,
        URL_RENAME_NOT_EXIST_ERROR: "Can't rename this url because it doesn't exist.",
        URL_RENAME_FORBIDDEN: "Can't rename this url because its not yours...",
        URL_RENAME_VALIDATION_ERROR: "Can't rename this url becuase the new name is invalid",
      };

      return parseAxiosError(error, RENAME_SHORT_URL_ERROR_CODES_TRANSLATION);
    }
  }

  public async deleteShortUrl(shortUrlId: string): Promise<void> {
    try {
      await this.axiosClient.delete<'Ok'>(`/deleteShortUrl/${shortUrlId}`);
    } catch (error: any) {
      const DELETE_SHORT_URL_ERROR_CODES_TRANSLATION = {
        BAD_TOKEN_ERROR: 'Auth error, try to login / re-login.',
        URL_DELETE_NOT_EXIST_ERROR: "Can't delete this url because it doesn't exist.",
        URL_DELETE_FORBIDDEN: "Can't delete this url because its not yours...",
        URL_DELETE_ERROR: "Can't delete this url, try again later.",
      };

      return parseAxiosError(error, DELETE_SHORT_URL_ERROR_CODES_TRANSLATION);
    }
  }
}

export default new LinksService();
