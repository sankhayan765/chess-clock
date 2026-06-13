import { useState } from "react";
import presets from "../utils/presets";

function SetTime({
    onSetTime,
    onClose,
}) {
    const [customMinutes, setCustomMinutes] =
        useState("");

    const [customSeconds, setCustomSeconds] =
        useState("");

    const [customIncrement, setCustomIncrement] =
        useState("");

    const [modalOpen, setModalOpen] = useState(false);

    const handleApply = () => {
        const totalTime =
            (Number(customMinutes || 0) * 60 +
                Number(customSeconds || 0)) *
            1000;

        const increment =
            Number(customIncrement || 0) *
            1000;

        if (totalTime <= 0) {
            setModalOpen(true);
            return;
        }

        onSetTime(
            totalTime,
            increment
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Set Time Control</h2>

                <div className="presets">
                    {presets.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() =>
                                onSetTime(
                                    preset.initialTime,
                                    preset.increment
                                )
                            }
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>



                <h3>Custom Time</h3>

                <div className="custom-time">
                    <input
                        type="number"
                        min="0"
                        placeholder="Minutes"
                        value={customMinutes}
                        onChange={(e) =>
                            setCustomMinutes(
                                e.target.value
                            )
                        }
                    />

                    <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Seconds"
                        value={customSeconds}
                        onChange={(e) =>
                            setCustomSeconds(
                                e.target.value
                            )
                        }
                    />

                    <input
                        type="number"
                        min="0"
                        placeholder="Increment (sec)"
                        value={customIncrement}
                        onChange={(e) =>
                            setCustomIncrement(
                                e.target.value
                            )
                        }
                    />

                    <button
                        onClick={handleApply}
                    >
                        Apply
                    </button>
                </div>

                <button
                    className="close-btn"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>

            {modalOpen && (
                <div className="error-modal-overlay"
                    onClick={(e) => {
                        e.stopPropagation();
                        setModalOpen(false);
                    }}>
                    <div className="error-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Invalid Time</h3>
                        <p>Please enter a valid time greater than 0.</p>

                        <button
                            className="error-btn"
                            onClick={() => setModalOpen(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SetTime;