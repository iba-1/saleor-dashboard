import { IFilter, IFilterElement } from "@saleor/components/Filter";
import { findValueInEnum, getFullName } from "@saleor/misc";
import { SearchCustomers_search_edges_node } from "@saleor/searches/types/SearchCustomers";
import { SearchProducts_search_edges_node } from "@saleor/searches/types/SearchProducts";
import { GiftCardFilterInput } from "@saleor/types/globalTypes";
import {
  createFilterTabUtils,
  createFilterUtils,
  dedupeFilter,
  getMultipleValueQueryParam,
  getSingleValueQueryParam
} from "@saleor/utils/filters";
import {
  createAutocompleteField,
  createNumberField,
  createOptionsField,
  createTextField
} from "@saleor/utils/filters/fields";
import {
  mapNodeToChoice,
  mapPersonNodeToChoice,
  mapSingleValueNodeToChoice
} from "@saleor/utils/maps";
import { defineMessages, IntlShape } from "react-intl";

import { giftCardsListTableMessages } from "../messages";
import { GiftCardListUrlQueryParams } from "../types";
import {
  GiftCardListFilterKeys,
  GiftCardListFilterOpts,
  GiftCardListUrlFilters,
  GiftCardListUrlFiltersEnum,
  GiftCardStatusFilterEnum,
  SearchWithFetchMoreProps
} from "./types";

export const GIFT_CARD_FILTERS_KEY = "giftCardFilters";

interface GiftCardFilterOptsProps {
  params: GiftCardListUrlFilters;
  currencies: string[];
  currencySearchProps: SearchWithFetchMoreProps;
  products: SearchProducts_search_edges_node[];
  productSearchProps: SearchWithFetchMoreProps;
  customers: SearchCustomers_search_edges_node[];
  customerSearchProps: SearchWithFetchMoreProps;
  balanceCurrencies: string[];
  balanceCurrencySearchProps: SearchWithFetchMoreProps;
  tag: string[];
  tagSearchProps: SearchWithFetchMoreProps;
}

export const getFilterOpts = ({
  params,
  currencies,
  currencySearchProps,
  products,
  productSearchProps,
  customers,
  customerSearchProps,
  balanceCurrencies,
  balanceCurrencySearchProps,
  tag,
  tagSearchProps
}: GiftCardFilterOptsProps): GiftCardListFilterOpts => ({
  currency: {
    active: !!params?.currency,
    value: params?.currency,
    choices: mapSingleValueNodeToChoice(currencies),
    displayValues: mapSingleValueNodeToChoice(currencies),
    initialSearch: "",
    hasMore: currencySearchProps.hasMore,
    loading: currencySearchProps.loading,
    onFetchMore: currencySearchProps.onFetchMore,
    onSearchChange: currencySearchProps.onSearchChange
  },
  product: {
    active: !!params?.product,
    value: params?.product,
    choices: mapNodeToChoice(products),
    displayValues: mapSingleValueNodeToChoice(products),
    initialSearch: "",
    hasMore: productSearchProps.hasMore,
    loading: productSearchProps.loading,
    onFetchMore: productSearchProps.onFetchMore,
    onSearchChange: productSearchProps.onSearchChange
  },
  usedBy: {
    active: !!params?.usedBy,
    value: params?.usedBy,
    choices: mapPersonNodeToChoice(customers),
    displayValues: mapPersonNodeToChoice(customers),
    initialSearch: "",
    hasMore: customerSearchProps.hasMore,
    loading: customerSearchProps.loading,
    onFetchMore: customerSearchProps.onFetchMore,
    onSearchChange: customerSearchProps.onSearchChange
  },
  balanceCurrency: {
    active: !!params?.balanceCurrency,
    value: params?.balanceCurrency,
    choices: mapSingleValueNodeToChoice(balanceCurrencies),
    displayValues: mapSingleValueNodeToChoice(balanceCurrencies),
    initialSearch: "",
    hasMore: balanceCurrencySearchProps.hasMore,
    loading: balanceCurrencySearchProps.loading,
    onFetchMore: balanceCurrencySearchProps.onFetchMore,
    onSearchChange: balanceCurrencySearchProps.onSearchChange
  },
  tag: {
    active: !!params?.tag,
    value: dedupeFilter(params?.tag || []),
    choices: mapSingleValueNodeToChoice(tag),
    displayValues: mapSingleValueNodeToChoice(tag),
    initialSearch: "",
    hasMore: tagSearchProps.hasMore,
    loading: tagSearchProps.loading,
    onFetchMore: tagSearchProps.onFetchMore,
    onSearchChange: tagSearchProps.onSearchChange
  },
  balanceAmount: {
    active: !!params?.balanceAmount,
    value: params?.balanceAmount
  },
  status: {
    active: !!params?.status,
    value: params?.status
  }
});

export function getFilterQueryParam(
  filter: IFilterElement<GiftCardListFilterKeys>
): GiftCardListUrlFilters {
  const { name } = filter;

  const {
    balanceAmount,
    balanceCurrency,
    tag,
    currency,
    usedBy,
    product,
    status
  } = GiftCardListFilterKeys;

  console.log({ ...filter });
  switch (name) {
    case balanceAmount:
    case balanceCurrency:
    case currency:
    case status:
      return getSingleValueQueryParam(filter, name);

    case tag:
    case product:
    case usedBy:
      return getMultipleValueQueryParam(filter, name);
  }
}

const messages = defineMessages({
  balanceAmountLabel: {
    defaultMessage: "Amount",
    description: "amount filter label"
  },
  tagLabel: {
    defaultMessage: "Tags",
    description: "tag filter label"
  },
  currencyLabel: {
    defaultMessage: "Currency",
    description: "currency filter label"
  },
  productLabel: {
    defaultMessage: "Product",
    description: "product filter label"
  },
  usedByLabel: {
    defaultMessage: "Used by",
    description: "used by filter label"
  },
  statusLabel: {
    defaultMessage: "Status",
    description: "status filter label"
  },
  enabledOptionLabel: {
    defaultMessage: "Enabled",
    description: "enabled status option label"
  },
  disabledOptionLabel: {
    defaultMessage: "Disabled",
    description: "disabled status option label"
  }
});

export function createFilterStructure(
  intl: IntlShape,
  opts: GiftCardListFilterOpts
): IFilter<GiftCardListFilterKeys> {
  return [
    {
      active: opts.balanceAmount.active && opts.balanceCurrency.active,
      name: GiftCardListFilterKeys.balance,
      label: intl.formatMessage(
        giftCardsListTableMessages.giftCardsTableColumnBalanceTitle
      ),
      multipleFields: [
        {
          required: true,
          ...createTextField(
            GiftCardListFilterKeys.balanceAmount,
            intl.formatMessage(messages.balanceAmountLabel),
            opts.balanceAmount.value
          )
        },
        {
          required: true,
          ...createAutocompleteField(
            GiftCardListFilterKeys.balanceCurrency,
            intl.formatMessage(messages.currencyLabel),
            [opts.balanceCurrency.value],
            opts.balanceCurrency.displayValues,
            false,
            opts.balanceCurrency.choices,
            {
              hasMore: opts.balanceCurrency.hasMore,
              initialSearch: "",
              loading: opts.balanceCurrency.loading,
              onFetchMore: opts.balanceCurrency.onFetchMore,
              onSearchChange: opts.balanceCurrency.onSearchChange
            }
          )
        }
      ]
    } as IFilterElement<GiftCardListFilterKeys.balance>,
    {
      active: opts.currency.active,
      ...createAutocompleteField(
        GiftCardListFilterKeys.currency,
        intl.formatMessage(messages.currencyLabel),
        [opts.currency.value],
        opts.currency.displayValues,
        false,
        opts.currency.choices,
        {
          hasMore: opts.currency.hasMore,
          initialSearch: "",
          loading: opts.currency.loading,
          onFetchMore: opts.currency.onFetchMore,
          onSearchChange: opts.currency.onSearchChange
        }
      )
    },
    {
      active: opts.tag.active,
      ...createAutocompleteField(
        GiftCardListFilterKeys.tag,
        intl.formatMessage(messages.tagLabel),
        opts.tag.value,
        opts.tag.displayValues,
        true,
        opts.tag.choices,
        {
          hasMore: opts.tag.hasMore,
          initialSearch: "",
          loading: opts.tag.loading,
          onFetchMore: opts.tag.onFetchMore,
          onSearchChange: opts.tag.onSearchChange
        }
      )
    },
    {
      active: opts.product.active,
      ...createAutocompleteField(
        GiftCardListFilterKeys.product,
        intl.formatMessage(messages.productLabel),
        [opts.product.value],
        opts.product.displayValues,
        true,
        opts.product.choices,
        {
          hasMore: opts.product.hasMore,
          initialSearch: "",
          loading: opts.product.loading,
          onFetchMore: opts.product.onFetchMore,
          onSearchChange: opts.product.onSearchChange
        }
      )
    },
    {
      active: opts.usedBy.active,
      ...createAutocompleteField(
        GiftCardListFilterKeys.usedBy,
        intl.formatMessage(messages.usedByLabel),
        [opts.usedBy.value],
        opts.usedBy.displayValues,
        false,
        opts.usedBy.choices,
        {
          hasMore: opts.usedBy.hasMore,
          initialSearch: "",
          loading: opts.usedBy.loading,
          onFetchMore: opts.usedBy.onFetchMore,
          onSearchChange: opts.usedBy.onSearchChange
        }
      )
    },
    {
      ...createOptionsField(
        GiftCardListFilterKeys.status,
        intl.formatMessage(messages.statusLabel),
        [opts.status.value],
        false,
        [
          {
            label: intl.formatMessage(messages.enabledOptionLabel),
            value: GiftCardStatusFilterEnum.enabled
          },
          {
            label: intl.formatMessage(messages.disabledOptionLabel),
            value: GiftCardStatusFilterEnum.disabled
          }
        ]
      ),
      active: opts.status.active
    }
  ];
}

export const {
  deleteFilterTab,
  getFilterTabs,
  saveFilterTab
} = createFilterTabUtils<GiftCardListUrlFilters>(GIFT_CARD_FILTERS_KEY);

export const {
  areFiltersApplied,
  getActiveFilters,
  getFiltersCurrentTab
} = createFilterUtils<GiftCardListUrlQueryParams, GiftCardListUrlFilters>(
  GiftCardListUrlFiltersEnum
);

export function getFilterVariables(
  params: GiftCardListUrlQueryParams
): GiftCardFilterInput {
  return {
    isActive: params.status === "enabled" ? true : false,
    tags: params.tag,
    usedBy: params.usedBy,
    products: params.product,
    currency: params.currency
    // balanceAmount: params.balanceAmount,
    // balanceCurrency: params.balanceCurrency
  };
}
