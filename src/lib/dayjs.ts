import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.locale("es-mx");

export default dayjs;
