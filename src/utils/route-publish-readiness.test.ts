import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatPublishRouteFailure } from "./route-publish-readiness";

const driverMessage =
  "Asigna un chofer en la pestaña Chofer antes de publicar la ruta.";

describe("formatPublishRouteFailure", () => {
  it("muestra el mensaje único del API", () => {
    const message = formatPublishRouteFailure(
      {
        errorCode: "ROUTE_PUBLISH_REQUIREMENTS_NOT_MET",
        message: driverMessage,
        requirementErrors: [
          { code: "DRIVER_REQUIRED", message: driverMessage },
        ],
      },
      "fallback",
    );
    assert.equal(message, driverMessage);
  });

  it("usa el resumen cuando faltan varios requisitos", () => {
    const summary =
      "No se puede publicar la ruta. Completa: vehículo, chofer y al menos un artículo en el manifiesto.";
    const message = formatPublishRouteFailure(
      {
        errorCode: "ROUTE_PUBLISH_REQUIREMENTS_NOT_MET",
        message: summary,
        requirementErrors: [
          { code: "VEHICLE_REQUIRED", message: "vehículo" },
          { code: "DRIVER_REQUIRED", message: "chofer" },
          { code: "MANIFEST_REQUIRED_DELIVERIES", message: "manifiesto" },
        ],
      },
      "fallback",
    );
    assert.equal(message, summary);
  });

  it("conserva el fallback si el error no es de publicación", () => {
    assert.equal(
      formatPublishRouteFailure(
        { errorCode: "INVALID_ROUTE_TRANSITION", message: "Transición inválida" },
        "No se pudo publicar la ruta: Transición inválida",
      ),
      "No se pudo publicar la ruta: Transición inválida",
    );
  });
});
