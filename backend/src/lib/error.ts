import { Client, createClient } from 'node-ses';

let emailEnabled = false;
let client: Client;

const error = (msg: string) => {
  console.error(msg);
  console.trace();

  let msgString = new Error().stack as string;
  msgString += '\n\n';
  if (typeof msg === 'string') {
    msgString += msg.trim();
  } else {
    msgString += JSON.stringify(msg) || 'Unable to display, please check the logs';
  }

  if (emailEnabled) {
    client.sendEmail({
      from: 'bccovid_error@dav.sh',
      to: 'davi@d-shen.xyz',
      subject: 'Error with BC Covid-19 dashboard backend.',
      message: msgString.replace(/\r?\n/g, '<br />'),
      altText: msgString,
    }, (err, _data, _res) => {
      if (err) {
        console.error('Error with email notification:', err);
      }
    });
  }
};

export const setup = () => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    error('AWS SES keys not provided, email notifications will not be sent on errors.');
    return;
  }

  client = createClient({
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    amazon: 'https://email.us-east-1.amazonaws.com',
  });

  emailEnabled = true;
};

export default error;
