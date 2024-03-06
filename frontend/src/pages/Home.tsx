import {
  ChakraProvider, Box, Text, VStack, Input, Button, theme, Textarea, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { Logo } from "../components/Logo";
import axios from "axios";
import { useState } from "react";
import { ContentCard } from "../components/ContentCard";
import { API_ENDPOINT, mainColor, subColor } from "../assets/constants";
import { ContentList } from "../components/ContentList";
import { ContentType } from "../types/ContentType";

export const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({
    what: "",
    who: "",
    detail: "",
  });

  const [loading, setLoading] = useState(false);
  const [newContent, setNewContent] = useState<ContentType | null>();
  const [isFormValid, setIsFormValid] = useState(false);

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
      const result = await axios.post(`${API_ENDPOINT}/iikae`, formData);
      setNewContent(result.data.content);
      onOpen();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleModalClose = () => {
    setFormData({
      what: "",
      who: "",
      detail: "",
    });
    setIsFormValid(false);
    onClose();
  };

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center">
        <VStack spacing={8} marginTop={8}>
          <Logo h="30vmin" pointerEvents="none" />
          <VStack spacing={1}>
            <Text fontSize="md" as="b">誰に？</Text>
            <Input value={formData.who} placeholder="会社のお偉いさん" onChange={(e) => handleChange(e, "who")} />
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="md" as="b">何を言いたい？</Text>
            <Textarea value={formData.what} placeholder="カツラずれてますよ" onChange={(e) => handleChange(e, "what")} minH={10} />
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="md" as="b">詳しく</Text>
            <Textarea value={formData.detail}
              placeholder="たまに会社のお偉いさんと一緒にゴルフに行くことがあるが、よくカツラがずれていて気まずい"
              onChange={(e) => handleChange(e, "detail")}
              minH={28}
            />
          </VStack>
          <Button
            color="white"
            backgroundColor={mainColor}
            size="md"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!isFormValid}
            _hover={{ backgroundColor: mainColor }}
          >
            いい感じに言い換える
          </Button>

          <Modal isOpen={isOpen} onClose={handleModalClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader></ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {newContent ? <ContentCard
                  content_id={newContent.content_id}
                  who={newContent.who}
                  what={newContent.what}
                  detail={newContent.detail}
                  paraphrases={newContent.paraphrases}
                /> : <Text>
                  ごめん、何かエラーが起きたみたい。もう一度試してみてね😭
                </Text>}
              </ModalBody>
              <ModalFooter>
                <Button backgroundColor={mainColor} color="white" mr={3} onClick={handleModalClose}>
                  閉じる
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <ContentList />
        </VStack>
      </Box>
    </ChakraProvider>
  );
};
