
import { Request, Response, NextFunction } from "express";
import { RequestBody, PathParams, QueryParams, ResponseBody } from "./index";
import Students,{IStudents} from '../../../models/studentModel';
import bcrypt from "bcryptjs";
import { ErrorMessageCode, logger } from "../../../utils/default";
export default  () =>
  async (
	req: Request<RequestBody>,
	res: Response<ResponseBody>,
	next: NextFunction,
) =>{
  try{
    console.log("enter student register")
    req.body.email = req.body.email.toLowerCase();
    const existingStudent = await Students.findOne({ email: req.body.email });
    if (existingStudent) {
      throw new Error(ErrorMessageCode.STUDENT_ALREADY_EXISTS);
    } 
   
    req.body.password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    const newStudent: IStudents = new Students({
			...req.body   
		});
    const savedStudent = await newStudent.save();
		logger.debug(
			`Student ${savedStudent.email} created. ID: ${savedStudent._id}`,
		);  
  const resp = {
    success: true,
    statusCode: 201,
    successMessage: "Student registered successfully",
  };
  return res.status(201).json(resp)
  }
  catch(error){
    console.log(error)
    logger.error("Error while registering Student.", error);
    return next(error);
  }
}

  
