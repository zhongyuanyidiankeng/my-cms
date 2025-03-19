import { ObjectId } from 'mongodb';

export interface CmsModule {
  _id?: ObjectId;
  name: string;
  config: CmsModuleConfig;
  route?: string;
}

export interface CmsModuleConfig {
  icon: string;
  desc: string;
}

export default CmsModule;