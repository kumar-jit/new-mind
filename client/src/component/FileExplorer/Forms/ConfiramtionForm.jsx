import { FormCard } from "../../ui/Cards";
import { Modal } from "../../ui/Modal";

export default function ConfirmationForm({
    setIsOpened,
    isOponed,
    ref,
    confirmBtn,
    cancleBtn,
    clearBtn,
    title,
    msg,
}) {
    const confirmBtnInfo = { label: "Confirm", onClick: () => {}, show: true, ...confirmBtn}
    const cancleBtnInfo = { label: "Cancle", onClick: () => {setIsOpened?.(false)}, show: true,...cancleBtn }
    const clearBtnInfo = { label: "X", onClick: () => {setIsOpened?.(false)}, show: true, ...clearBtn }

    return (
        <Modal setOpen={setIsOpened}>
            <FormCard
                ref={ref}
                applyBtn={{ ...confirmBtnInfo }}
                cancelBtn={{...cancleBtnInfo}}
                clearBtn={{...clearBtnInfo}}
                title={title || "Confirmation"}
            >
                <div className="form-group">
                    <label>{msg}</label>
                </div>
            </FormCard>
        </Modal>
    );
}
