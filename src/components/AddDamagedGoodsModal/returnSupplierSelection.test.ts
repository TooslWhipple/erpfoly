import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    nextReturnSupplierValue,
    returnSupplierIdForDisposition,
} from "./returnSupplierSelection";

describe("nextReturnSupplierValue", () => {
    it("autoselects the only commercial supplier", () => {
        assert.equal(nextReturnSupplierValue("", [{ id: 4 }]), "4");
    });

    it("keeps a valid choice when the SKU has several suppliers", () => {
        assert.equal(
            nextReturnSupplierValue("8", [{ id: 4 }, { id: 8 }]),
            "8",
        );
    });

    it("clears a stale or workshop id and does not guess among several", () => {
        assert.equal(nextReturnSupplierValue("99", [{ id: 4 }, { id: 8 }]), "");
        assert.equal(nextReturnSupplierValue("", [{ id: 4 }, { id: 8 }]), "");
    });

    it("clears the field when the SKU has no commercial suppliers", () => {
        assert.equal(nextReturnSupplierValue("4", []), "");
    });
});

describe("returnSupplierIdForDisposition", () => {
    it("serializes the selected supplier only for a return", () => {
        assert.equal(returnSupplierIdForDisposition("RETURN_TO_SUPPLIER", "12"), 12);
        assert.equal(returnSupplierIdForDisposition("REPAIR_WITH_SUPPLIER", "12"), undefined);
        assert.equal(returnSupplierIdForDisposition("RETURN_TO_SUPPLIER", ""), undefined);
    });
});
