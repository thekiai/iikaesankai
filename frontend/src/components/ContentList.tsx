import { useInfiniteQuery } from 'react-query';
import { useState } from 'react';
import axios from 'axios';
import { VStack, Box } from '@chakra-ui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ContentCard } from "./ContentCard";
import { ContentType } from '../types/ContentType';
import { API_ENDPOINT } from '../assets/constants';
import { CustomSpinner } from './CustomSpinner';

const PER_PAGE = 5;

const fetchContents = async (page: number, order_by: string) => {
    const response = await axios.get(`${API_ENDPOINT}/contents/?page=${page}&per_page=${PER_PAGE}&order_by=${order_by}`);
    return response.data.contents;
};

export const ContentList: React.FC = () => {
    const [orderBy, setOrderBy] = useState('latest');  // latestまたはranking
    const [currentPage, setCurrentPage] = useState(1);

    const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery(
        'contents',
        ({ pageParam = 1 }) => {
            setCurrentPage(pageParam); // 現在のページ番号をセット
            return fetchContents(pageParam, orderBy);
        },
        {
            getNextPageParam: (lastPage, pages) => {
                if (lastPage.length === PER_PAGE) {
                    return currentPage + 1;
                }
                return undefined;  // 次のページがない場合
            },
            staleTime: 6000000, // 100分間キャッシュを利用
        }
    );

    const contents = data ? data.pages.flat() : [];

    return (isFetching ? <CustomSpinner /> :
        <InfiniteScroll
            dataLength={contents.length}
            next={() => fetchNextPage()}
            hasMore={hasNextPage ?? false}
            loader={<CustomSpinner />}
            scrollThreshold={0.9}
        >
            <VStack spacing={8} maxWidth="500px">
                {contents.map((content: ContentType) => (
                    <Box key={content.content_id} borderTop="2px" borderColor="gray.200" borderStyle="dashed">
                        <ContentCard content_id={content.content_id} who={content.who} what={content.what} detail={content.detail} paraphrases={content.paraphrases} />
                    </Box>
                ))}
            </VStack>
        </InfiniteScroll>
    );
};
