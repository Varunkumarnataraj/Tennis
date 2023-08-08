import { Request, Response, NextFunction } from "@express-types";
import { RequestBody, PathParams, QueryParams, ResponseBody } from "./index";
import Students from '../../../models/studentModel';
import { ErrorMessageCode, logger } from "../../../utils/default";

export default () =>
	async (
		req: Request<RequestBody,QueryParams, PathParams>,
		res: Response<ResponseBody>,
		next: NextFunction,
	) => {
    try {
      console.log("req.params",req.params)
      // console.log("req.params2",req.openapi.pathParams)

      const student = await Students.findOne({
				_id: req.params._id
				
			});
      console.log("student = ", student );
  
      if (!student) throw Error(ErrorMessageCode.STUDENT_NOT_FOUND);
      if ( student) {
				const updatedStudent = await Students.updateOne({
                    _id: student._id,
                }, {
                    $set: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        password: req.body.password,
                        gender: req.body.gender,
                        studentId: req.body.studentId,
                        bloodGroup: req.body.bloodGroup,
                        contact: req.body.contact,
                        department: req.body.department,
                        dateOfBirth: req.body.dateOfBirth,
                        address: req.body.address,
                        city: req.body.city,
                        state: req.body.state,
                        country: req.body.country,
                        zipcode: req.body.zipcode,
                        isDeleted : req.body.isDeleted,
                    },
                });
                console.log("updatedStudent =", updatedStudent)
                const resp: ResponseBody = {
                  success: true,
                  statusCode: 200,
                  successMessage: "Profile Updated Successfully",
                };
                console.log("updatedCustomer =", updatedStudent)
                return res.status(200).json(resp);
    } 
   }  catch (err) {
			next(err);
			logger.error("Error while updating student.", err);
		}
  }
  

