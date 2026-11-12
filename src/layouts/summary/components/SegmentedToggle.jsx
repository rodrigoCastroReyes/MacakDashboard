import PropTypes from "prop-types";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

/** Selector de dos o tres opciones con el estilo de los del resto del panel. */
function SegmentedToggle({ value, onChange, options, label }) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, v) => v && onChange(v)}
      aria-label={label}
      sx={({ palette, borders }) => ({
        flexShrink: 0,
        "& .MuiToggleButton-root": {
          textTransform: "none",
          fontSize: "12px",
          fontWeight: 600,
          px: 1.5,
          py: 0.5,
          color: palette.text.main,
          borderColor: palette.grey[300],
          borderRadius: borders.borderRadius.lg,
          "&.Mui-selected": {
            color: palette.white.main,
            backgroundColor: palette.info.main,
            "&:hover": { backgroundColor: palette.info.focus },
          },
        },
      })}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

SegmentedToggle.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  label: PropTypes.string.isRequired,
};

export default SegmentedToggle;
