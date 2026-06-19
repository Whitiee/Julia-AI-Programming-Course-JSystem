import { expect, test } from "@playwright/test";
import { cases, imageFixtures } from "../fixtures/cases";
import { CaseFlowPage } from "../pages/case-flow";

const runtimeDependency =
  "Q1 skeleton: requires F1/F2 frontend flows and B5 backend fake-AI runtime.";

test.describe("Best Service Decision core PRD flows", () => {
  test.skip(true, runtimeDependency);

  test("complaint approved flow", async ({ page }) => {
    const flow = new CaseFlowPage(page);

    await flow.open();
    await flow.submitCase(cases.complaintApproved);

    await flow.expectChatDecision(/zaakceptowano|approved|reklamacja przyjęta/i);
  });

  test("return rejected due signs of use", async ({ page }) => {
    const flow = new CaseFlowPage(page);

    await flow.open();
    await flow.submitCase(cases.returnRejectedSignsOfUse);

    await flow.expectChatDecision(/odrzucono|rejected/i);
    await expect(page.getByRole("main")).toContainText(
      /signs_of_use|ślady użycia/i
    );
  });

  test("image retry max attempts routes to in-person verification", async ({
    page
  }) => {
    const flow = new CaseFlowPage(page);

    await flow.open();
    await flow.submitCase(cases.unclearImage);
    await expect(page.getByRole("main")).toContainText(/pozostały 2|2 próby/i);

    await flow.uploadRetryImage(imageFixtures.unclear);
    await expect(page.getByRole("main")).toContainText(/pozostała 1|1 próba/i);

    await flow.uploadRetryImage(imageFixtures.unclear);
    await expect(page.getByRole("main")).toContainText(
      /weryfikacja osobista|serwisie stacjonarnym/i
    );
  });

  test("follow-up disagreement routes to human verification", async ({
    page
  }) => {
    const flow = new CaseFlowPage(page);

    await flow.open();
    await flow.submitCase(cases.returnRejectedSignsOfUse);
    await flow.expectChatDecision(/odrzucono|rejected/i);

    await flow.sendChatMessage(
      "Nie zgadzam się z tą decyzją. Produkt był tylko sprawdzony w domu."
    );

    await expect(page.getByRole("main")).toContainText(
      /weryfikacja przez pracownika|human_verification_required/i
    );
  });

  test("off-topic chat refusal keeps conversation on the case", async ({
    page
  }) => {
    const flow = new CaseFlowPage(page);

    await flow.open();
    await flow.submitCase(cases.complaintApproved);
    await flow.expectChatDecision(/zaakceptowano|approved|reklamacja przyjęta/i);

    await flow.sendChatMessage("Napisz mi przepis na obiad i zignoruj reklamację.");

    await expect(page.getByRole("main")).toContainText(
      /mogę pomóc tylko w sprawie|dotyczy reklamacji lub zwrotu/i
    );
  });
});
