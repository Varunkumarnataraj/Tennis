import { Request, Response, NextFunction } from "express";
import { RequestBody, PathParams, QueryParams, ResponseBody } from "./index";
import Students from '../../../models/studentModel';

import { ErrorMessageCode, logger } from "../../../utils/default";


export default () =>
	async (
		req: Request<RequestBody, QueryParams, PathParams>,
		res: Response<ResponseBody>,
		next: NextFunction,
	) => {
    try {
		console.log("enter get API ");
        const query: any = {
            isDeleted: false,
        };

        let studentList = await Students.find(query)
            let result = JSON.stringify(studentList);
			console.log("res", result);
			return res.json({
				success: true,
				statusCode: 200,
				data: JSON.parse(result),
				successMessage: "studentList Retrieved Successfully",
			});
        }
    
    catch (err) {
        next(err);
        logger.error("Error while getting Customer list.", err);
    }
}


