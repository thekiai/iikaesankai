import {
  Box, Text, VStack,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { BasePage } from "./BasePage";
import { useEffect, useState } from "react";
import { ContentType } from "../types/ContentType";
import axios from "axios";
import { API_ENDPOINT } from "../assets/constants";
import { ContentCard } from "../components/ContentCard";
import { CustomSpinner } from "../components/CustomSpinner";

export const ContentPage = () => {
  const { content_id } = useParams<{ content_id: string }>();
  const [contentData, setContentData] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const result = await axios.get(`${API_ENDPOINT}/contents/${content_id}/`);
        setContentData(result.data);
      } catch (error: any) {
        console.error('データの取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, []);
  return (
    <BasePage>
      <VStack spacing={8} maxWidth="500px">
        {loading ? (
          <CustomSpinner />
        ) : contentData ? (
          <Box borderTop="2px" borderColor="gray.200" borderStyle="dashed">
            <ContentCard
              content_id={contentData.content_id}
              who={contentData.who}
              what={contentData.what}
              detail={contentData.detail}
              paraphrases={contentData.paraphrases}
            />
          </Box>
        ) : (
          <Text>ごめんね😭エラーだ</Text>
        )}
      </VStack>
    </BasePage>
  )
};
