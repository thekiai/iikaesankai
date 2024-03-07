import { useInfiniteQuery } from 'react-query';
import { useState } from 'react';
import axios from 'axios';
import { VStack, Text, Box } from '@chakra-ui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ContentCard } from "./ContentCard";
import { ContentType } from '../types/ContentType';
import { API_ENDPOINT } from '../assets/constants';

const PAGE_SIZE = 10;  // ページごとのアイテム数

const fetchContents = async (page: number, order_by: string) => {
    const response = await axios.get(`${API_ENDPOINT}/contents/?page=${page}&order_by=${order_by}`);
    return response.data.contents;
};

export const ContentList: React.FC = () => {
    const [orderBy, setOrderBy] = useState('latest');  // latestまたはranking
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        'contents',
        ({ pageParam = 1 }) => fetchContents(pageParam, orderBy),
        {
            getNextPageParam: (lastPage: any) => {
                // 仮の実装: 無限スクロールの際に次のページ番号をインクリメント
                return lastPage.length === PAGE_SIZE ? lastPage.length + 1 : undefined;
            },
            staleTime: 6000000, // 100分間キャッシュを利用
        }
    );

    const contents = data ? data.pages.flat() : [];

    return (
        <InfiniteScroll
            dataLength={contents.length}
            next={() => fetchNextPage()}
            hasMore={hasNextPage ?? false}
            loader={<p>Loading...</p>}
            scrollThreshold={0.9}
        >
            <VStack spacing={8} maxWidth="500px">
                {contents.map((content: ContentType) => (
                    <Box key={content.content_id} padding={8} borderTop="2px" borderColor="gray.200" borderStyle="dashed">
                        <ContentCard content_id={content.content_id} who={content.who} what={content.what} detail={content.detail} paraphrases={content.paraphrases} />
                    </Box>
                ))}
            </VStack>
        </InfiniteScroll >
    );
};
