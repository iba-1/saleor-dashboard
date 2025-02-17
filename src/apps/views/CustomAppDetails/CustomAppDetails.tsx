import AppActivateDialog from "@saleor/apps/components/AppActivateDialog";
import AppDeactivateDialog from "@saleor/apps/components/AppDeactivateDialog";
import TokenCreateDialog from "@saleor/apps/components/TokenCreateDialog";
import TokenDeleteDialog from "@saleor/apps/components/TokenDeleteDialog";
import NotFoundPage from "@saleor/components/NotFoundPage";
import { WindowTitle } from "@saleor/components/WindowTitle";
import { API_URI } from "@saleor/config";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import useShop from "@saleor/hooks/useShop";
import { commonMessages } from "@saleor/intl";
import { extractMutationErrors, getStringOrPlaceholder } from "@saleor/misc";
import getAppErrorMessage from "@saleor/utils/errors/app";
import createDialogActionHandlers from "@saleor/utils/handlers/dialogActionHandlers";
import WebhookDeleteDialog from "@saleor/webhooks/components/WebhookDeleteDialog";
import { useWebhookDeleteMutation } from "@saleor/webhooks/mutations";
import { WebhookDelete } from "@saleor/webhooks/types/WebhookDelete";
import { webhookAddPath, webhookPath } from "@saleor/webhooks/urls";
import React from "react";
import { useIntl } from "react-intl";

import CustomAppDetailsPage, {
  CustomAppDetailsPageFormData
} from "../../components/CustomAppDetailsPage";
import {
  useAppActivateMutation,
  useAppDeactivateMutation,
  useAppTokenCreateMutation,
  useAppTokenDeleteMutation,
  useAppUpdateMutation
} from "../../mutations";
import { useAppDetails } from "../../queries";
import { AppTokenCreate } from "../../types/AppTokenCreate";
import { AppTokenDelete } from "../../types/AppTokenDelete";
import { AppUpdate } from "../../types/AppUpdate";
import {
  appsListUrl,
  customAppUrl,
  CustomAppUrlDialog,
  CustomAppUrlQueryParams
} from "../../urls";

interface OrderListProps {
  id: string;
  params: CustomAppUrlQueryParams;
  token: string;
  onTokenClose: () => void;
}

export const CustomAppDetails: React.FC<OrderListProps> = ({
  id,
  params,
  token,
  onTokenClose
}) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const intl = useIntl();
  const shop = useShop();

  React.useEffect(() => onTokenClose, []);

  const [openModal, closeModal] = createDialogActionHandlers<
    CustomAppUrlDialog,
    CustomAppUrlQueryParams
  >(navigate, params => customAppUrl(id, params), params);

  const { data, loading, refetch } = useAppDetails({
    displayLoader: true,
    variables: { id }
  });
  const [activateApp, activateAppResult] = useAppActivateMutation({
    onCompleted: data => {
      const errors = data?.appActivate?.errors;
      if (errors?.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage({
            defaultMessage: "App activated",
            description: "snackbar text"
          })
        });
        refetch();
        closeModal();
      } else {
        errors.forEach(error =>
          notify({
            status: "error",
            text: getAppErrorMessage(error, intl)
          })
        );
      }
    }
  });
  const [deactivateApp, deactivateAppResult] = useAppDeactivateMutation({
    onCompleted: data => {
      const errors = data?.appDeactivate?.errors;
      if (errors.length === 0) {
        notify({
          status: "success",
          text: intl.formatMessage({
            defaultMessage: "App deactivated",
            description: "snackbar text"
          })
        });
        refetch();
        closeModal();
      } else {
        errors.forEach(error =>
          notify({
            status: "error",
            text: getAppErrorMessage(error, intl)
          })
        );
      }
    }
  });

  const onWebhookDelete = (data: WebhookDelete) => {
    if (data.webhookDelete.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.savedChanges)
      });
      navigate(customAppUrl(id));
      closeModal();
      refetch();
    }
  };

  const [webhookDelete, webhookDeleteOpts] = useWebhookDeleteMutation({
    onCompleted: onWebhookDelete
  });

  const handleRemoveWebhookConfirm = () => {
    webhookDelete({
      variables: {
        id: params.id
      }
    });
  };

  const onAppUpdate = (data: AppUpdate) => {
    if (data?.appUpdate?.errors?.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.savedChanges)
      });
    }
  };
  const handleBack = () => navigate(appsListUrl());
  const customApp = data?.app;

  if (customApp === null) {
    return <NotFoundPage onBack={handleBack} />;
  }

  const onTokenCreate = (data: AppTokenCreate) => {
    if (data?.appTokenCreate?.errors.length === 0) {
      refetch();
    }
  };
  const onTokenDelete = (data: AppTokenDelete) => {
    if (data?.appTokenDelete?.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.savedChanges)
      });
      refetch();
      closeModal();
    }
  };

  const [updateApp, updateAppOpts] = useAppUpdateMutation({
    onCompleted: onAppUpdate
  });
  const [createToken, createTokenOpts] = useAppTokenCreateMutation({
    onCompleted: onTokenCreate
  });
  const [deleteToken, deleteTokenOpts] = useAppTokenDeleteMutation({
    onCompleted: onTokenDelete
  });

  const handleSubmit = async (data: CustomAppDetailsPageFormData) =>
    extractMutationErrors(
      updateApp({
        variables: {
          id,
          input: {
            name: data.name,
            permissions: data.hasFullAccess
              ? shop.permissions.map(permission => permission.code)
              : data.permissions
          }
        }
      })
    );

  const handleTokenCreate = (name: string) =>
    createToken({
      variables: {
        input: {
          app: id,
          name
        }
      }
    });

  const handleTokenDelete = () =>
    deleteToken({
      variables: {
        id: params.id
      }
    });

  const handleActivateConfirm = () => {
    activateApp({ variables: { id } });
  };
  const handleDeactivateConfirm = () => {
    deactivateApp({ variables: { id } });
  };

  const currentToken = data?.app?.tokens?.find(token => token.id === params.id);

  return (
    <>
      <WindowTitle title={getStringOrPlaceholder(customApp?.name)} />
      <CustomAppDetailsPage
        apiUri={API_URI}
        disabled={loading}
        errors={updateAppOpts.data?.appUpdate?.errors || []}
        token={token}
        navigateToWebhookDetails={id => () => navigate(webhookPath(id))}
        onApiUriClick={() => open(API_URI, "blank")}
        onBack={handleBack}
        onSubmit={handleSubmit}
        onTokenClose={onTokenClose}
        onTokenCreate={() => openModal("create-token")}
        onTokenDelete={id =>
          openModal("remove-token", {
            id
          })
        }
        onWebhookCreate={() => navigate(webhookAddPath(id))}
        onWebhookRemove={id =>
          openModal("remove-webhook", {
            id
          })
        }
        onAppActivateOpen={() => openModal("app-activate")}
        onAppDeactivateOpen={() => openModal("app-deactivate")}
        permissions={shop?.permissions}
        app={data?.app}
        saveButtonBarState={updateAppOpts.status}
      />
      <TokenCreateDialog
        confirmButtonState={createTokenOpts.status}
        onClose={closeModal}
        onCreate={handleTokenCreate}
        open={params.action === "create-token"}
        token={createTokenOpts.data?.appTokenCreate.authToken}
      />
      <TokenDeleteDialog
        confirmButtonState={deleteTokenOpts.status}
        name={
          currentToken?.name || currentToken?.authToken
            ? `**** ${currentToken.authToken}`
            : "..."
        }
        onClose={closeModal}
        onConfirm={handleTokenDelete}
        open={params.action === "remove-token"}
      />
      <WebhookDeleteDialog
        confirmButtonState={webhookDeleteOpts.status}
        name={
          data?.app?.webhooks.find(webhook => webhook.id === params.id)?.name
        }
        onClose={closeModal}
        onConfirm={handleRemoveWebhookConfirm}
        open={params.action === "remove-webhook"}
      />
      <AppActivateDialog
        confirmButtonState={activateAppResult.status}
        name={data?.app.name}
        onClose={closeModal}
        onConfirm={handleActivateConfirm}
        open={params.action === "app-activate"}
      />
      <AppDeactivateDialog
        confirmButtonState={deactivateAppResult.status}
        name={data?.app.name}
        onClose={closeModal}
        onConfirm={handleDeactivateConfirm}
        thirdParty={false}
        open={params.action === "app-deactivate"}
      />
    </>
  );
};

export default CustomAppDetails;
