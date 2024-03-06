import { ChakraProvider, Box, Text, VStack, Grid, theme } from "@chakra-ui/react";
import { Logo } from "../components/Logo";
import { useLocation } from "react-router-dom";

export const Result = () => {
    const location = useLocation();
    const response = location.state?.response;

    return (
        <ChakraProvider theme={theme}>
            <Box textAlign="center" fontSize="xl">
                <Grid minH="100vh" p={3}>
                    <VStack spacing={8}>
                        <Logo h="40vmin" pointerEvents="none" />
                        {response && response.message.length > 0 ? (
                            response.message.map((message: string, index: number) => (
                                <Text key={index}>{message}</Text>
                            ))
                        ) : (
                            <Text>No messages available.</Text>
                        )}
                    </VStack>
                </Grid>
            </Box>
        </ChakraProvider>
    );
};



