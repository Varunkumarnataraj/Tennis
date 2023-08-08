import { Request, Response, NextFunction } from "express";
import { RequestBody, PathParams, QueryParams, ResponseBody } from "./index";
import Students from '../../../models/studentModel';
import bcrypt from "bcryptjs";
import { ErrorMessageCode, logger } from "../../../utils/default";
import { HydratedDocument } from "mongoose";
import { generateCustomerLoginResponse} from "../../../helpers/auth/LoginHelper";
export default  () =>
async (
  req: Request<RequestBody>,
  res: Response<ResponseBody>,
  next: NextFunction,
) => {
  try{
    console.log("enter student login");
    let student: any;
            let student1: HydratedDocument<any>
            student = await Students.findOne({ email: req.body.email,
              isDeleted: false, });
          	if (!student) throw new Error(ErrorMessageCode.STUDENT_NOT_FOUND);
	
            if(student){

              const isValid = await bcrypt.compare(req.body.password, student.password);
                    console.log("isValid,",isValid)
              if (!isValid) throw new Error(ErrorMessageCode.INCORRECT_PASSWORD);
              student1 = {
                _id : student._id .toString(),
                email: student.email,
                firstName: student.firstName,
                lastName: student.lastName
              }
              const response = await generateCustomerLoginResponse(student1              
                );
                      console.log(response);
                logger.debug(` ${student.email} logged in.`);
                return res.status(response.statusCode).json(response);
              }
            }catch (err) {
              logger.error("An Error occurred during e-mail login", err);
                    console.log(err);
              next(err);
            }
          };


 

