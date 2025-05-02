import { FormCard } from "../../ui/Cards";
import { Modal } from "../../ui/Modal";

export default function FilterForm({ isOponed, setIsOpened, ref }) {
    return (
        <Modal setOpen={setIsOpened}>
            <FormCard ref={ref}>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" placeholder="Folder name" />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <input type="text" placeholder="Description" />
                </div>

                <div className="form-group date-wrapper">
                    <label>Date</label>
                    <input type="date" placeholder="DD-MM-YYYY" />
                </div>
            </FormCard>
        </Modal>
    );
}
