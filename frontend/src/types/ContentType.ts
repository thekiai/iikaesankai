type Paraphrase = {
    paraphrase_id: string;
    content: string;
    vote_count: number;
};

export type ContentType = {
    content_id: string;
    who: string;
    what: string;
    detail: string;
    paraphrases: Paraphrase[];
};
