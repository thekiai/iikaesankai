import React, { useRef } from 'react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    VStack,
    Text,
    Input,
    Textarea,
    Button,
    useDisclosure,
} from "@chakra-ui/react";
import { mainColor } from '../assets/constants';


interface InputSectionProps {
    formData: {
        who: string;
        what: string;
        detail: string;
    };
    isFormValid: boolean;
    loading: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, label: string) => void;
    handleSubmit: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
    formData,
    isFormValid,
    loading,
    handleChange,
    handleSubmit,
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef(null);
    const handleConfirm = () => {
        handleSubmit();
        onClose();
    };

    return (
        <VStack spacing={8}>
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
                isLoading={loading}
                isDisabled={!isFormValid}
                _hover={{ backgroundColor: mainColor }}
                onClick={onOpen}
            >
                いい感じに言い換えて！
            </Button>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            確認✋
                        </AlertDialogHeader>

                        <AlertDialogCloseButton />

                        <AlertDialogBody>
                            送信された内容はこのサイト内で公開されるよ。問題ないかな？🤔
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                キャンセル
                            </Button>
                            <Button backgroundColor={mainColor} color="white" onClick={handleConfirm} ml={3}>
                                問題なし！送信する
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
};

export default InputSection;
