
import {moment} from "moment";

export default formatDate = (date) => {
    return moment(date).formatDate("YYYY-MM-DD");
} 