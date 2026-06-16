import {
    GetCommerceCasesQuery,
    GetCheckoutsQuery,
    StatusCheckout,
    PaymentChannel,
    ExtendedCheckoutStatus,
} from "pcp-server-nodejs-sdk";

export function buildCommerceCasesQuery(params: Record<string, unknown>): GetCommerceCasesQuery {
    const q = new GetCommerceCasesQuery();
    if (params.offset != null) q.setOffset(params.offset as number);
    if (params.size != null) q.setSize(params.size as number);
    if (params.fromDate != null) q.setFromDate(params.fromDate as string);
    if (params.toDate != null) q.setToDate(params.toDate as string);
    if (params.commerceCaseId != null) q.setCommerceCaseId(params.commerceCaseId as string);
    if (params.merchantReference != null) q.setMerchantReference(params.merchantReference as string);
    if (params.merchantCustomerId != null) q.setMerchantCustomerId(params.merchantCustomerId as string);
    if (params.includeCheckoutStatus != null) q.setIncludeCheckoutStatus((params.includeCheckoutStatus as string[]).map((s) => s as StatusCheckout));
    if (params.includePaymentChannel != null) q.setIncludePaymentChannel((params.includePaymentChannel as string[]).map((s) => s as PaymentChannel));
    return q;
}

export function buildCheckoutsQuery(params: Record<string, unknown>): GetCheckoutsQuery {
    const q = new GetCheckoutsQuery();
    if (params.offset != null) q.setOffset(params.offset as number);
    if (params.size != null) q.setSize(params.size as number);
    if (params.fromDate != null) q.setFromDate(params.fromDate as string);
    if (params.toDate != null) q.setToDate(params.toDate as string);
    if (params.fromCheckoutAmount != null) q.setFromCheckoutAmount(params.fromCheckoutAmount as number);
    if (params.toCheckoutAmount != null) q.setToCheckoutAmount(params.toCheckoutAmount as number);
    if (params.fromOpenAmount != null) q.setFromOpenAmount(params.fromOpenAmount as number);
    if (params.toOpenAmount != null) q.setToOpenAmount(params.toOpenAmount as number);
    if (params.fromCollectedAmount != null) q.setFromCollectedAmount(params.fromCollectedAmount as number);
    if (params.toCollectedAmount != null) q.setToCollectedAmount(params.toCollectedAmount as number);
    if (params.fromCancelledAmount != null) q.setFromCancelledAmount(params.fromCancelledAmount as number);
    if (params.toCancelledAmount != null) q.setToCancelledAmount(params.toCancelledAmount as number);
    if (params.fromRefundAmount != null) q.setFromRefundAmount(params.fromRefundAmount as number);
    if (params.toRefundAmount != null) q.setToRefundAmount(params.toRefundAmount as number);
    if (params.fromChargebackAmount != null) q.setFromChargebackAmount(params.fromChargebackAmount as number);
    if (params.toChargebackAmount != null) q.setToChargebackAmount(params.toChargebackAmount as number);
    if (params.checkoutId != null) q.setCheckoutId(params.checkoutId as string);
    if (params.merchantReference != null) q.setMerchantReference(params.merchantReference as string);
    if (params.merchantCustomerId != null) q.setMerchantCustomerId(params.merchantCustomerId as string);
    if (params.includePaymentProductId != null) q.setIncludePaymentProductId(params.includePaymentProductId as number[]);
    if (params.includeCheckoutStatus != null) q.setIncludeCheckoutStatus((params.includeCheckoutStatus as string[]).map((s) => s as StatusCheckout));
    if (params.includeExtendedCheckoutStatus != null) q.setIncludeExtendedCheckoutStatus((params.includeExtendedCheckoutStatus as string[]).map((s) => s as ExtendedCheckoutStatus));
    if (params.includePaymentChannel != null) q.setIncludePaymentChannel((params.includePaymentChannel as string[]).map((s) => s as PaymentChannel));
    if (params.paymentReference != null) q.setPaymentReference(params.paymentReference as string);
    if (params.paymentId != null) q.setPaymentId(params.paymentId as string);
    if (params.firstName != null) q.setFirstName(params.firstName as string);
    if (params.surname != null) q.setSurname(params.surname as string);
    if (params.email != null) q.setEmail(params.email as string);
    if (params.phoneNumber != null) q.setPhoneNumber(params.phoneNumber as string);
    if (params.dateOfBirth != null) q.setDateOfBirth(params.dateOfBirth as string);
    if (params.companyInformation != null) q.setCompanyInformation(params.companyInformation as string);
    if (params.terminalId != null) q.setTerminalId(params.terminalId as string);
    if (params.reportingToken != null) q.setReportingToken(params.reportingToken as string);
    return q;
}