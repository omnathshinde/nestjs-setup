import * as dynamoose from "dynamoose";

const ddb = new dynamoose.aws.ddb.DynamoDB({
	region: "ap-south-1",
	endpoint: "http://localhost:4566",
	credentials: {
		accessKeyId: "test",
		secretAccessKey: "test",
	},
});

dynamoose.aws.ddb.set(ddb);
export default dynamoose;
