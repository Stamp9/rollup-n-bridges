import assert from "assert";
import { 
  TestHelpers,
  RelayDepository_RelayErc20Deposit
} from "generated";
const { MockDb, RelayDepository } = TestHelpers;

describe("RelayDepository contract RelayErc20Deposit event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for RelayDepository contract RelayErc20Deposit event
  const event = RelayDepository.RelayErc20Deposit.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("RelayDepository_RelayErc20Deposit is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await RelayDepository.RelayErc20Deposit.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualRelayDepositoryRelayErc20Deposit = mockDbUpdated.entities.RelayDepository_RelayErc20Deposit.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedRelayDepositoryRelayErc20Deposit: RelayDepository_RelayErc20Deposit = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      from: event.params.from,
      token: event.params.token,
      amount: event.params.amount,
      id: event.params.id,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualRelayDepositoryRelayErc20Deposit, expectedRelayDepositoryRelayErc20Deposit, "Actual RelayDepositoryRelayErc20Deposit should be the same as the expectedRelayDepositoryRelayErc20Deposit");
  });
});
