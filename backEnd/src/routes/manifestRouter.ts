import { Request, Response } from 'express';

export const getManifest = (req: Request, res: Response): void => {
    const manifest = {
        url: "https://ton-connect.github.io/WordOfDay",
        name: "WordOfDay",
        iconUrl: "https://shuriginadiana.net/api/img/1734509860742-83414557.PNG",
        termsOfUseUrl: "https://ton-connect.github.io/demo-dapp/terms-of-use.txt",
        privacyPolicyUrl: "https://ton-connect.github.io/demo-dapp/privacy-policy.txt"
    };

    res.json(manifest);
};