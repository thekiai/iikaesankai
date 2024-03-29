import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { VStack, Box, Center, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
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
    const [rankingContents, setRankingContents] = useState<ContentType[]>([]);
    const [rankingCurrentPage, setRankingCurrentPage] = useState(1);
    const [rankingHasNextPage, setRankingHasNextPage] = useState(true);
    const [rankingIsFetching, setRankingIsFetching] = useState(true);
    const [rankingError, setRankingError] = useState(false);

    const [latestContents, setLatestContents] = useState<ContentType[]>([]);
    const [latestCurrentPage, setLatestCurrentPage] = useState(1);
    const [latestHasNextPage, setLatestHasNextPage] = useState(true);
    const [latestIsFetching, setLatestIsFetching] = useState(true);
    const [latestError, setLatestError] = useState(false);

    const fetchRankingContents = async () => {
        try {
            const newItems = await fetchContents(rankingCurrentPage, "ranking");
            setRankingContents((prevItems) => [...prevItems, ...newItems]);
            if (newItems.length < PER_PAGE) {
                setRankingHasNextPage(false);
            }
            setRankingCurrentPage((prevPage) => prevPage + 1);
        } catch (error) {
            console.error("Error fetching ranking data: ", error);
            setRankingError(true);
            setRankingHasNextPage(false);
        } finally {
            setRankingIsFetching(false);
        }
    };

    const fetchLatestContents = async () => {
        try {
            const newItems = await fetchContents(latestCurrentPage, "latest");
            setLatestContents((prevItems) => [...prevItems, ...newItems]);
            if (newItems.length < PER_PAGE) {
                setLatestHasNextPage(false);
            }
            setLatestCurrentPage((prevPage) => prevPage + 1);
        } catch (error) {
            console.error("Error fetching latest data: ", error);
            setLatestError(true);
            setLatestHasNextPage(false);
        } finally {
            setLatestIsFetching(false);
        }
    };

    useEffect(() => {
        fetchRankingContents();
    }, []);

    useEffect(() => {
        fetchLatestContents();
    }, []);

    const fetchMoreRankingData = () => {
        fetchRankingContents();
    };

    const fetchMoreLatestData = () => {
        fetchLatestContents();
    };

    return (
        <>
            <Tabs position="relative" variant="line" colorScheme="black">
                <TabList style={{ justifyContent: 'center' }}>
                    <Tab color="gray.600">👑 ランキング</Tab>
                    <Tab color="gray.600">✨ 新着</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        {rankingError ?
                            <Center>
                                <Box color="gray.600">
                                    エラー発生😭リロードしてね
                                </Box>
                            </Center> :
                            rankingIsFetching && rankingCurrentPage === 1 ?
                                <Center mt={8}> <CustomSpinner /> </Center> :
                                <InfiniteScroll
                                    dataLength={rankingContents.length}
                                    next={fetchMoreRankingData}
                                    hasMore={rankingHasNextPage}
                                    loader={<Center mt={8}> <CustomSpinner /> </Center>}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <VStack maxWidth="500px">
                                        {rankingContents.map((content: ContentType) => (
                                            <Box
                                                key={content.content_id}
                                                borderBottom="2px"
                                                pb={8}
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
                        }
                    </TabPanel>
                    <TabPanel>
                        {rankingError ?
                            <Center>
                                <Box color="gray.600">
                                    エラー発生😭リロードしてね
                                </Box>
                            </Center> :
                            latestIsFetching && latestCurrentPage === 1 ?
                                <Center mt={8}> <CustomSpinner /> </Center> :
                                <InfiniteScroll
                                    dataLength={latestContents.length}
                                    next={fetchMoreLatestData}
                                    hasMore={latestHasNextPage}
                                    loader={<Center mt={8}> <CustomSpinner /> </Center>}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <VStack maxWidth="500px">
                                        {latestContents.map((content: ContentType) => (
                                            <Box
                                                key={content.content_id}
                                                borderBottom="2px"
                                                pb={8}
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
                        }
                    </TabPanel>
                </TabPanels>
            </Tabs >
        </>
    );
};
