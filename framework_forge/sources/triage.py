"""Rate and rank sources by evidence type and extraction value."""

from dataclasses import dataclass, asdict
from framework_forge.config import SOURCE_TYPES


@dataclass
class SourceEntry:
    """A single source in the bibliography."""

    title: str
    url: str
    source_type: str  # One of SOURCE_TYPES
    description: str
    evidence_layers: list[str]  # Which layers this source can feed: layer1, layer2, layer3
    fetched: bool = False
    text_path: str | None = None  # Path to fetched text file

    def to_dict(self) -> dict:
        return asdict(self)

    @property
    def rank(self) -> int:
        """Lower rank = higher value. Based on position in SOURCE_TYPES."""
        try:
            return SOURCE_TYPES.index(self.source_type)
        except ValueError:
            return len(SOURCE_TYPES)


def triage_sources(entries: list[SourceEntry]) -> list[SourceEntry]:
    """Sort sources by evidence value (most valuable first)."""
    return sorted(entries, key=lambda e: e.rank)
