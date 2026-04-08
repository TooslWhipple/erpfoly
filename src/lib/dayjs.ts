import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);
dayjs.locale("es-mx");

export default dayjs;
