import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
  },
  website: {
    type: String,
  },
  industry: {
    type: String,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);

export default Company;
