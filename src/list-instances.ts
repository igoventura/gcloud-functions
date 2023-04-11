import { HttpFunction, Request, Response } from '@google-cloud/functions-framework';
import { InstancesClient } from '@google-cloud/compute';
import { Storage } from '@google-cloud/storage';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { google } from '@google-cloud/compute/build/protos/protos';

/**
 * Instance interface
 * @interface Instance
 * @property {string | null | undefined} name The name of the instance
 * @property {string | null | undefined} status The status of the instance
 * @see https://cloud.google.com/compute/docs/reference/rest/v1/instances#status
 */
interface Instance {
    name: string | null | undefined;
    status: string | null | undefined;
}

/**
 * Saves the instances in a CSV file in the bucket
 * @param {Instance[]} instances
 * @returns {Promise<void>}
 * @see https://cloud.google.com/storage/docs/uploading-objects
 * @see https://cloud.google.com/storage/docs/creating-buckets
 */
async function saveInstancesCsv(instances: Instance[]): Promise<void> {
    // Get the current date in UTC and format it to be used as the file name
    dayjs.extend(utc);
    const currentDate = dayjs.utc().format('YYYY-MM-DDTHH:mm:ss');

    // Create the storage client
    const storage = new Storage({
        projectId: process.env.PROJECT_ID
    });

    // Try creating the bucket and if it already exists, get it
    let bucket;
    try {
        const [createdBucket, _] = await storage.createBucket(process.env.REPORTS_BUCKET!);
        bucket = createdBucket;
    } catch (err) {
        bucket = storage.bucket(process.env.REPORTS_BUCKET!);
    }

    // Create the file in the bucket
    const file = bucket.file(`${currentDate}.csv`);

    // Create the CSV content and save it
    const header = 'name,status';
    const instancesCsv = instances.map(instance => `${instance.name},${instance.status}`).join('\n');

    // Save the file
    await file.save(`${header}\n${instancesCsv}`);
}

/**
 * Returns an array of instances with the RUNNING status
 * @returns {Promise<Instance[]>}
 * @see https://cloud.google.com/compute/docs/reference/rest/v1/instances/list
 * @see https://cloud.google.com/compute/docs/reference/rest/v1/instances#status
 * @see https://cloud.google.com/compute/docs/reference/rest/v1/instances/list#query-parameters
 */
async function getInstances(): Promise<Instance[]> {
    // Create the request
    const request: google.cloud.compute.v1.IListInstancesRequest = {
        project: process.env.PROJECT_ID,
        zone: process.env.ZONE,
        filter: 'status=RUNNING', // Only get instances with the RUNNING status. You can filter like this: https://cloud.google.com/compute/docs/reference/rest/v1/instances/list#query-parameters
    };

    // Create the compute instances client
    const instancesClient = new InstancesClient({
        projectId: process.env.PROJECT_ID,
    });

    // Get the instances
    const iterable = instancesClient.listAsync(request);

    // Create the array of instances
    const instancesArray = [];

    // Iterate over the instances and add them to the array
    for await (const instance of iterable) {
        instancesArray.push({ name: instance.name, status: instance.status });
    }

    return instancesArray;
}

/**
 * Google cloud function that lists the instances with the RUNNING status and saves them in a CSV file in the bucket
 * @param req The request object. See https://cloud.google.com/functions/docs/writing/http#functions_http_framework_nodejs_parameters
 * @param res The response object. See https://cloud.google.com/functions/docs/writing/http#functions_http_framework_nodejs_parameters
 * @see https://cloud.google.com/functions/docs/writing/http
 * @see https://cloud.google.com/functions/docs/writing/http#functions_http_framework_nodejs_parameters
 * @see https://cloud.google.com/functions/docs/writing/http#functions_http_framework_nodejs
 */
export const listInstances: HttpFunction = async (req: Request, res: Response) => {
    await saveInstancesCsv(await getInstances());

    res.send('OK');
}