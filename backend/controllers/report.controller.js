import reportModel from '../models/report.model.js';

export async function progress(req, res, next) {
  try {
    const summary = await reportModel.progressSummary(req.user.id);
    return res.json({ success: true, data: summary });
  } catch (error) {
    return next(error);
  }
}
