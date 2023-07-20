import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  randomString: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  res.status(200).json({ randomString: 'This is not a random string' });
}
