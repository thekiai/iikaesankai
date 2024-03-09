import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { VStack, Box, Center } from "@chakra-ui/react";
import { ContentCard } from "./ContentCard";
import { ContentType } from "../types/ContentType";
import { API_ENDPOINT } from "../assets/constants";
import { CustomSpinner } from "./CustomSpinner";

const PER_PAGE = 5;

const fetchContents = async (page: number, order_by: string) => {
    const response = await axios.get(
        `${API_ENDPOINT}/contents/?page=${page}&per_page=${PER_PAGE}&order_by=${order_by}`
    );
    return response.data.contents;
};

export const ContentList: React.FC = () => {
    const [orderBy, setOrderBy] = useState("latest"); // latestまたはranking
    const [currentPage, setCurrentPage] = useState(1);
    const [contents, setContents] = useState<ContentType[]>([]);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isFetching, setIsFetching] = useState(true);

    const fetchData = async () => {
        try {
            const newItems = await fetchContents(currentPage, orderBy);
            setContents((prevItems) => [...prevItems, ...newItems]);
            if (newItems.length < PER_PAGE) {
                setHasNextPage(false);
            }
            setCurrentPage((prevPage) => prevPage + 1);
        } catch (error) {
            console.error("Error fetching data: ", error);
            setHasNextPage(false);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchMoreData = () => {
        fetchData();
    };

    return (
        <>
            {isFetching && currentPage === 1 ? (
                <CustomSpinner />
            ) : (
                <InfiniteScroll
                    dataLength={contents.length}
                    next={fetchMoreData}
                    hasMore={hasNextPage}
                    loader={<Center> <CustomSpinner /> </Center>}
                >
                    <VStack spacing={8} maxWidth="500px">
                        {contents.map((content: ContentType) => (
                            <Box
                                key={content.content_id}
                                borderTop="2px"
                                borderColor="gray.200"
                                borderStyle="dashed"
                            >
                                <ContentCard
                                    content_id={content.content_id}
                                    who={content.who}
                                    what={content.what}
                                    detail={content.detail}
                                    paraphrases={content.paraphrases}
                                />
                            </Box>
                        ))}
                    </VStack>
                </InfiniteScroll>
            )}
        </>
    );
};
