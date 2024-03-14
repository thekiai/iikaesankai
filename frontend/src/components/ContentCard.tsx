import { useEffect, useState } from "react";
import {
    Box,
    Text,
    VStack,
    Card,
    useColorModeValue,
    HStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useClipboard,
    useToast,
    Icon
} from "@chakra-ui/react";
import { API_ENDPOINT, mainColor, subColor } from "../assets/constants";
import { ContentType } from "../types/ContentType";
import axios from "axios";
import { FiShare } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

export const ContentCard: React.FC<ContentType> = ({
    content_id,
    who,
    what,
    detail,
    paraphrases,
}) => {
    const [selectedOption, setSelectedOption] = useState("");
    const [votingCompleted, setVotingCompleted] = useState(false);
    const [isNewVote, setIsNewVote] = useState(false);

    useEffect(() => {
        // ローカルストレージから投票結果を読み込む
        const savedVote = localStorage.getItem(`vote_${content_id}`);
        if (savedVote) {
            setSelectedOption(savedVote);
            setVotingCompleted(true);
        }
    }, [content_id]);

    const handleVote = async (paraphrase_id: string) => {
        setSelectedOption(paraphrase_id);
        try {
            await axios.post(`${API_ENDPOINT}/vote/`, {
                paraphrase_id: paraphrase_id,
            });
            // ローカルストレージに投票結果を保存する
            localStorage.setItem(`vote_${content_id}`, paraphrase_id);

            setVotingCompleted(true);
            setIsNewVote(true);
        } catch (error) {
            console.error("投票エラー:", error);
        }
    };

    const shareLink = `${window.location.origin}/contents/${content_id}`;  // 共有リンク
    const shareText = `${who}に\n「${what}」と言いたい🙋 \n\n どう言い換える？🤖💬\n\n`;
    const { hasCopied, onCopy } = useClipboard(shareLink);
    const toast = useToast();
    const cardBorderColor = useColorModeValue("gray.200", "gray.700");
    const selectedCardColor = useColorModeValue("gray.100", "gray.700");
    let totalVotes: number = paraphrases.reduce(
        (acc, paraphrase) => acc + paraphrase.vote_count,
        0
    );
    if (!votingCompleted) {
        totalVotes++;
    }
    const handleCopyClick = () => {
        onCopy();
        toast({
            render: () => (
                <Box color="white" p={3} bg={mainColor} borderRadius="lg">
                    リンクをコピーしました
                </Box>
            ),
        });
    };
    return (
        <VStack spacing={4}>
            <HStack ml="auto">
                <Menu>
                    <MenuButton mt={2}>
                        <Box borderRadius="full" p={3} bg="gray.100">
                            <FiShare />
                        </Box>
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={handleCopyClick}>
                            リンクをコピー
                        </MenuItem>
                        <MenuItem as='a' href={encodeURI(`https://twitter.com/intent/post?url=${shareLink}&text=${shareText}`) + "%23いいかえさんかい！%0A%20"} target='_blank'>
                            Xでシェア
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
            <VStack mb={4}>
                <VStack >
                    <Text fontSize="lg" fontWeight="bold" color={subColor}>
                        {who}
                    </Text>
                    <Text fontSize="md">に</Text>
                </VStack>
                <VStack >
                    <Text fontSize="lg" fontWeight="bold" color={subColor}>
                        {what}
                    </Text>
                    <Text fontSize="md">と言いたい</Text>
                </VStack>
                <Text fontSize="sm" color="grey" mt={4}>
                    {detail}
                </Text>
            </VStack>
            <VStack spacing={4}>
                <HStack>
                    <Text fontSize="md">
                        {!votingCompleted && "↓ 好きな言い換えに投票してね！"}
                    </Text>

                </HStack>
                {paraphrases.map((paraphrase) => {
                    let voteCount = paraphrase.vote_count;
                    if (selectedOption === paraphrase.paraphrase_id && isNewVote) {
                        voteCount++;
                    }

                    const votePercentage =
                        totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;

                    return (
                        <Box key={paraphrase.paraphrase_id} width="100%" textAlign="start">
                            <Card
                                variant="outline"
                                borderWidth="1px"
                                borderRadius="md"
                                padding={4}
                                onClick={votingCompleted ? undefined : () => handleVote(paraphrase.paraphrase_id)}
                                cursor={votingCompleted ? undefined : "pointer"}
                                borderColor={
                                    selectedOption === paraphrase.paraphrase_id ? selectedCardColor : cardBorderColor
                                }
                                background={
                                    selectedOption === paraphrase.paraphrase_id ? selectedCardColor : "transparent"
                                }
                                _hover={
                                    votingCompleted ? {} : { background: selectedCardColor }
                                }
                                position="relative"
                                align="end"
                            >
                                <HStack>
                                    <Icon
                                        mr={2}
                                        as={FaHeart}
                                        color={votingCompleted ? (selectedOption === paraphrase.paraphrase_id ? "red.400" : "gray.200") : "gray.200"}
                                        onClick={votingCompleted ? undefined : () => handleVote(paraphrase.paraphrase_id)}
                                    />
                                    <Text>{paraphrase.content}</Text>
                                </HStack>
                                {votingCompleted && (
                                    <Box
                                        height="4px"
                                        width={`${votePercentage}%`}
                                        background={subColor}
                                        position="absolute"
                                        bottom="0"
                                        left="0"
                                        borderRadius="md"
                                    />
                                )}

                                {votingCompleted && (
                                    <Text fontSize="sm" color="gray.500" mt={2}>
                                        {`${votePercentage.toFixed(0)}% [${voteCount} 票]`}
                                    </Text>
                                )}
                            </Card>
                        </Box>
                    );
                })}
            </VStack>
        </VStack >
    );
};
