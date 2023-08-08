
import { Request, Response, NextFunction } from "@express-types";
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
        const student = await Students.findOneAndUpdate(
                  {
                    _id: req.params._id,
                  },
                  {
                    $set: {
                      isDeleted: true,
                    },
                  },
                  { new: true }
                );
                
        if (!student) throw Error(ErrorMessageCode.STUDENT_NOT_FOUND);
  
        const resp: ResponseBody = {
          success: true,
          statusCode: 200,
          successMessage: "student Account  Deleted Successfully",
        };
        res.status(200).json(resp);
      } catch (err) {
        next(err);
        logger.error("Error while deleting student account.", err);
      }
  }
  
