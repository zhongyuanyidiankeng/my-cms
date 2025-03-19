import { ObjectId } from 'mongodb';

export interface ProgramKnowledge  {
  _id?: ObjectId;
  type?: string;
  example: Example[];
}

export interface Example {
    desc: string;
    code: string;
}

export default ProgramKnowledge;