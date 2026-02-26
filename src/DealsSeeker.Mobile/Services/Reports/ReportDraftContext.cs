namespace DealsSeeker.Mobile.Services.Reports;

public sealed class ReportDraftContext : IReportDraftContext
{
    private OfferReportDraft? _currentDraft;

    public void Set(OfferReportDraft draft)
    {
        _currentDraft = draft;
    }

    public OfferReportDraft? Consume()
    {
        var draft = _currentDraft;
        _currentDraft = null;
        return draft;
    }

    public void Clear()
    {
        _currentDraft = null;
    }
}
