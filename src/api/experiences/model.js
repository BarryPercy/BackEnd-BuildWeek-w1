import { DataTypes } from "sequelize"
import sequelize from "../../db.js"
import UsersModel from "../users/model.js"

const ExperiencesModel = sequelize.define(
  "experience",
  {
    experienceId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, 
    },
    role: {
      type: DataTypes.STRING(50), 
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(50), 
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE(50), 
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE(50), 
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING(50), 
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(250), 
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(50), 
      allowNull: false,
    },
  },
);


UsersModel.hasMany(ExperiencesModel, { foreignKey: { name: "userId", allowNull: false } })
ExperiencesModel.belongsTo(UsersModel, { foreignKey: { name: "userId", allowNull: false } })
export default ExperiencesModel
