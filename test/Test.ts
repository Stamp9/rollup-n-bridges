import assert from "assert";
import { 
  TestHelpers,
  L2StandardBridge_DepositFinalized
} from "generated";
const { MockDb, L2StandardBridge } = TestHelpers;

describe("L2StandardBridge contract DepositFinalized event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for L2StandardBridge contract DepositFinalized event
  const event = L2StandardBridge.DepositFinalized.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("L2StandardBridge_DepositFinalized is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await L2StandardBridge.DepositFinalized.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualL2StandardBridgeDepositFinalized = mockDbUpdated.entities.L2StandardBridge_DepositFinalized.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedL2StandardBridgeDepositFinalized: L2StandardBridge_DepositFinalized = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      l1Token: event.params.l1Token,
      l2Token: event.params.l2Token,
      from: event.params.from,
      to: event.params.to,
      amount: event.params.amount,
      extraData: event.params.extraData,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualL2StandardBridgeDepositFinalized, expectedL2StandardBridgeDepositFinalized, "Actual L2StandardBridgeDepositFinalized should be the same as the expectedL2StandardBridgeDepositFinalized");
  });
});
