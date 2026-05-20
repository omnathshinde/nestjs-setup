import * as dynamoose from "dynamoose";

const isProd = process.env.NODE_ENV === "production";

const ddb = new dynamoose.aws.ddb.DynamoDB({
	region: "ap-south-1",
	endpoint: "http://localhost:4566",
	credentials: {
		accessKeyId: "test",
		secretAccessKey: "test",
	},
});

dynamoose.aws.ddb.set(ddb);
// Global defaults for ALL models
dynamoose.Table.defaults.set({
	create: !isProd,
	update: !isProd,
	waitForActive: true,
});
export default dynamoose;
