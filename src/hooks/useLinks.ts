import { useState, useEffect, useCallback } from 'react';
import { Links } from '../services';
import { notifyLoading, updateNotify } from '../utils';
import type { UrlInfo } from '../types';

function useLinks() {
  const [isLoading, setIsLoading] = useState(false);
  const [linksList, setLinksList] = useState<UrlInfo[]>([]);
  const [isError, setIsError] = useState(false);

  const fetchLinks = (): void => {
    setIsLoading(true);
    setIsError(false);

    Links.getOwnShortUrls()
      .then((links) => {
        setLinksList(links);
        setIsLoading(false);
      })
      .catch((_error) => {
        setIsError(true);
        setIsLoading(false);
      });
  };

  // TODO: re-think in react query
  useEffect(() => {
    fetchLinks();
  }, []);

  const createLink = useCallback(
    async (fullUrl: string, customEnding?: string): Promise<boolean> => {
      const loadingId = notifyLoading('Creating a shorti...');
      try {
        const addedLink = await Links.createShortUrl(fullUrl, customEnding);

        const newLinksList = [...linksList, addedLink];

        setLinksList(newLinksList);
        updateNotify(loadingId, 'Created a shorti :)', 'success');

        return true;
      } catch (error: any) {
        updateNotify(loadingId, error.message, 'error');

        return false;
      }
    },
    [linksList]
  );

  const renameLink = useCallback(
    async (id: string, linkName: string): Promise<boolean> => {
      const loadingId = notifyLoading('Updating shorti name...');
      try {
        await Links.renameShortUrl(id, linkName);

        const newLinksList = linksList.map((linkInfo) => {
          if (linkInfo.id === id) {
            return { ...linkInfo, linkId: linkName };
          }

          return linkInfo;
        });
        setLinksList(newLinksList);
        updateNotify(loadingId, `Renamed shorti to: ${linkName}`, 'success');

        return true;
      } catch (error: any) {
        updateNotify(loadingId, error.message, 'error');

        return false;
      }
    },
    [linksList]
  );

  const deleteLink = useCallback(
    async (id: string): Promise<void> => {
      const loadingId = notifyLoading('deleting a shorti...');
      try {
        await Links.deleteShortUrl(id);

        const filteredLinks = linksList.filter((urlInfo) => {
          return urlInfo.id !== id;
        });

        setLinksList(filteredLinks);
        updateNotify(loadingId, 'Deleted a shorti :(', 'success');
      } catch (error: any) {
        updateNotify(loadingId, error.message, 'error');
      }
    },
    [linksList]
  );

  return { isLoading, linksList, isError, fetchLinks, createLink, renameLink, deleteLink };
}

export default useLinks;
