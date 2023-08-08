import { Request, Response, NextFunction } from "@express-types";
import { RequestBody, PathParams, QueryParams, ResponseBody } from "../src/types/index";
import { logger } from "../src/utils/default";

export default () =>
    async (req: Request<RequestBody, QueryParams, PathParams>, res: Response<ResponseBody>, next: NextFunction) => {
        try {
            return res.json({});
        } catch (err) {
            logger.error("error: ", err);
            next(err);
        }
    };
