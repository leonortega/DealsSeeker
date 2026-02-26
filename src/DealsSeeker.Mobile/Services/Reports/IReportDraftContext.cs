namespace DealsSeeker.Mobile.Services.Reports;

public interface IReportDraftContext
{
    void Set(OfferReportDraft draft);

    OfferReportDraft? Consume();

    void Clear();
}
