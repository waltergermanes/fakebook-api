const nodemailer = require("nodemailer");
require("dotenv").config()

module.exports = async (email, subject, text) => {
	try {
		const transporter = nodemailer.createTransport({
			//host: `smtp.gmail.com`,
			service: process.env.SERVICE,
			//port: Number(`587`),
			//secure:true,
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASSWORD,
			},
		});

		await transporter.sendMail({
			from: process.env.EMAIL,
			to: email,
			subject: subject,
			text: text,
		});
		console.log("email sent successfully");
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return error;
	}
};