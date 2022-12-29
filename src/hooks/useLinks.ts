import { useState, useEffect, useCallback } from 'react';
import { Links } from '../services';
import type { UrlInfo } from '../types';

function useLinks() {
  const [isLoading, setIsLoading] = useState(false);
  const [linksList, setLinksList] = useState<UrlInfo[]>([]);
  const [isError, setIsError] = useState(false);

  // TODO: re-think in react query
  useEffect(() => {
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
  }, []);

  const createLink = useCallback(
    async (fullUrl: string): Promise<void> => {
      try {
        const addedLink = await Links.createShortUrl(fullUrl);

        const newLinksList = [...linksList, addedLink];

        setLinksList(newLinksList);
      } catch (error) {
        console.error(error);
      }
    },
    [linksList]
  );

  const deleteLink = useCallback(
    async (id: string): Promise<void> => {
      try {
        await Links.deleteShortUrl(id);

        const filteredLinks = linksList.filter((urlInfo) => {
          return urlInfo.id !== id;
        });

        setLinksList(filteredLinks);
      } catch (error) {
        console.error(error);
      }
    },
    [linksList]
  );

  return { isLoading, linksList, isError, createLink, deleteLink };
}

export default useLinks;
