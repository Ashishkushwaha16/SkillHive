const Feedback = require("../models/Feedback");
const {
  submitFeedback,
  getFeedbackEntries,
} = require("../controllers/feedbackController");

jest.mock("../models/Feedback", () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("feedbackController.submitFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects missing feedback message", async () => {
    const req = {
      body: { category: "general", message: "   " },
      user: { _id: "507f1f77bcf86cd799439011" },
    };
    const res = createRes();

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Feedback message is required" });
    expect(Feedback.create).not.toHaveBeenCalled();
  });

  test("rejects message shorter than minimum length", async () => {
    const req = {
      body: { category: "general", message: "short" },
      user: { _id: "507f1f77bcf86cd799439011" },
    };
    const res = createRes();

    await submitFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Feedback message should be at least 8 characters",
    });
    expect(Feedback.create).not.toHaveBeenCalled();
  });

  test("creates feedback with normalized defaults and returns created id", async () => {
    const req = {
      body: { category: "unknown", message: "  this app is useful and stable  " },
      user: { _id: "507f1f77bcf86cd799439011" },
    };
    const res = createRes();

    Feedback.create.mockResolvedValue({
      _id: "65f39f7f81db649f3db21a77",
    });

    await submitFeedback(req, res);

    expect(Feedback.create).toHaveBeenCalledWith({
      user: req.user._id,
      category: "general",
      message: "this app is useful and stable",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Thanks for your feedback",
      feedbackId: "65f39f7f81db649f3db21a77",
    });
  });
});

describe("feedbackController.getFeedbackEntries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns feedback entries sorted by latest with user fields", async () => {
    const req = {};
    const res = createRes();

    const payload = [
      {
        _id: "65f39f7f81db649f3db21a77",
        category: "bug",
        message: "Sample message",
      },
    ];

    const populate = jest.fn().mockResolvedValue(payload);
    const sort = jest.fn().mockReturnValue({ populate });
    Feedback.find.mockReturnValue({ sort });

    await getFeedbackEntries(req, res);

    expect(Feedback.find).toHaveBeenCalledWith({});
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(populate).toHaveBeenCalledWith("user", "name email");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(payload);
  });
});
