import { ChakraProvider, Box, Text, VStack, Button, theme, useDisclosure, Tooltip, Link } from "@chakra-ui/react";
import { Logo } from "../components/Logo";
import axios from "axios";
import { useState } from "react";
import { ContentCard } from "../components/ContentCard";
import { API_ENDPOINT, mainColor } from "../assets/constants";
import { ContentType } from "../types/ContentType";
import InputSection from "../components/InputSection";
import CustomModal from "../components/CustomModal";
import { Link as RouterLink } from "react-router-dom";

interface BasePageProps {
    children: React.ReactNode;
}

export const BasePage: React.FC<BasePageProps> = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenInput, onOpen: onOpenInput, onClose: onCloseInput } = useDisclosure();

    const [formData, setFormData] = useState({
        what: "",
        who: "",
        detail: "",
    });

    const [loading, setLoading] = useState(false);
    const [newContent, setNewContent] = useState<ContentType | null>();
    const [isFormValid, setIsFormValid] = useState(false);
    const [isInvalidInput, setIsInvalidInput] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, label: string) => {
        const updatedFormData = {
            ...formData,
            [label]: e.target.value,
        };
        setFormData(updatedFormData);
        // Check if all form fields have non-empty values
        const isValid = Object.values(updatedFormData).every((value) => value.trim() !== "");
        setIsFormValid(isValid);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            onCloseInput();
            const result = await axios.post(`${API_ENDPOINT}/iikae/`, formData);
            setNewContent(result.data.content);
            setIsInvalidInput(false);
            onOpen();
        } catch (error: any) {
            if (error.response.status === 400) {
                setIsInvalidInput(true);
            }
            setNewContent(null);
            onOpen();
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        if (newContent !== null) {
            setFormData({
                what: "",
                who: "",
                detail: "",
            });
            setIsFormValid(false);
        }
        onClose();
    };

    return (
        <ChakraProvider theme={theme}>
            <VStack spacing={8} mt={8} mb={52} px={4}>
                <Text color="gray">
                    言いにくいことをAIが言い換えて言い返すモヤモヤ解決プラットフォーム！
                </Text>
                <Link as={RouterLink} to="/">
                    <Logo h="30vmin" pointerEvents="none" />
                </Link>
                <Box position="sticky" top="5%" zIndex="docked">
                    <Tooltip label="言い換えを考え中🤔 10秒以上かかっちゃうかも" hasArrow placement="bottom" isOpen={loading}>
                        <Button
                            variant="outline"
                            color="white"
                            backgroundColor={mainColor}
                            borderColor={mainColor}
                            size="md"
                            onClick={onOpenInput}
                            _hover={{ backgroundColor: mainColor, color: "white" }}
                            isLoading={loading}
                            borderRadius="md"
                        >
                            いいかえて！
                        </Button>
                    </Tooltip>
                </Box>
                <CustomModal isOpen={isOpenInput} onClose={onCloseInput}>
                    <InputSection
                        formData={formData}
                        isFormValid={isFormValid}
                        loading={loading}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                    />
                </CustomModal>

                <CustomModal isOpen={isOpen} onClose={handleModalClose}>
                    {isInvalidInput ?
                        <Text>
                            ちょっと不適切な言葉が含まれてるかも🤔 他の言い方で試してみてね
                        </Text>
                        : newContent ? <ContentCard
                            content_id={newContent.content_id}
                            who={newContent.who}
                            what={newContent.what}
                            detail={newContent.detail}
                            paraphrases={newContent.paraphrases}
                        /> : <Text>
                            何かエラーが起きたみたい😭 ごめんだけどもう一度試してみてね。
                        </Text>}
                </CustomModal>
                {children}
            </VStack>
        </ChakraProvider>
    );
};
