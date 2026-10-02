import React, { useState, useMemo, useEffect } from 'react';
import './TagsPanel.css';
import searchIcon from '../assets/icons/search-icon.svg';
import plusIcon from '../assets/icons/plus-icon.svg';
import chevronDownSmall from '../assets/icons/s-chevron-down.svg';
import kebabMenuIcon from '../assets/icons/kebab-menu.svg';
import editSignIcon from '../assets/icons/edit-sign.svg';
import deleteSignIcon from '../assets/icons/delete-sign.svg';
import CreateTagModal from './CreateTagModal';

// Tag hierarchy matching Figma node 16:5841 & progressive drilldown
const RAW_TAG_DATA = [
  {
    id: 'customers',
    name: 'Customers',
    isFolder: true,
    color: '#1f93ff',
    theme: 'blue',
    children: [
      {
        id: 'na',
        name: 'North America',
        isFolder: true,
        color: '#1f93ff',
        theme: 'blue',
        children: [
          { id: 'tier1', name: 'Tier 1', isFolder: false, count: 1, color: '#1f93ff', theme: 'blue' },
          { id: 'tier2', name: 'Tier 2', isFolder: false, count: 1, color: '#fb923c', theme: 'orange' },
          { id: 'tier3', name: 'Tier 3', isFolder: false, count: 1, color: '#8b5cf6', theme: 'lavender' },
        ]
      },
      {
        id: 'emea',
        name: 'EMEA',
        isFolder: true,
        color: '#10b981',
        theme: 'green',
        children: [
          { id: 'uk_ireland', name: 'UK & Ireland', isFolder: false, count: 2, color: '#1f93ff', theme: 'blue' },
          { id: 'dach', name: 'DACH Region', isFolder: false, count: 1, color: '#10b981', theme: 'green' }
        ]
      },
      {
        id: 'midmarket',
        name: 'Mid Market',
        isFolder: true,
        color: '#eab308',
        theme: 'yellow',
        children: [
          { id: 'inbound_leads', name: 'Inbound Leads', isFolder: false, count: 4, color: '#eab308', theme: 'yellow' },
          { id: 'renewals_q4', name: 'Renewals Q4', isFolder: false, count: 2, color: '#8b5cf6', theme: 'lavender' }
        ]
      }
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    isFolder: true,
    color: '#8b5cf6',
    theme: 'lavender',
    children: [
      {
        id: 'logistics',
        name: 'Logistics',
        isFolder: true,
        color: '#8b5cf6',
        theme: 'lavender',
        children: [
          { id: 'delivery_issues', name: 'Delivery Issues', isFolder: false, count: 3, color: '#fb923c', theme: 'orange' },
          { id: 'address_change', name: 'Address Change', isFolder: false, count: 1, color: '#8b5cf6', theme: 'lavender' }
        ]
      }
    ]
  },
  {
    id: 'technical_support',
    name: 'Technical Support',
    isFolder: true,
    color: '#ec4899',
    theme: 'pink',
    children: [
      {
        id: 'bug_reports',
        name: 'Bug Reports',
        isFolder: false,
        count: 7,
        color: '#ec4899',
        theme: 'pink'
      },
      {
        id: 'feature_requests',
        name: 'Feature Requests',
        isFolder: false,
        count: 11,
        color: '#10b981',
        theme: 'green'
      }
    ]
  },
  // Root level leaf tags (matching Figma screenshot exactly!)
  {
    id: 'inbox',
    name: 'Inbox',
    isFolder: false,
    count: 1,
    color: '#1f93ff',
    theme: 'blue'
  },
  {
    id: 'ooo',
    name: 'Out of Office mails',
    isFolder: false,
    count: 6,
    color: '#e879f9',
    theme: 'pink'
  },
  {
    id: 'priority',
    name: 'Priority',
    isFolder: false,
    count: 3,
    color: '#fb923c',
    theme: 'orange'
  }
];

// Enrich tree nodes with path, aggregated counts, and colors
function enrichTagTree(nodes, parentPath = [], inheritedColor = '#1f93ff', inheritedTheme = 'blue') {
  return nodes.map(node => {
    const curPath = node.path || [...parentPath, node.name];
    let children = undefined;
    let count = node.count;
    const color = node.color || inheritedColor;
    const theme = node.theme || inheritedTheme;

    if (node.children && node.children.length > 0) {
      children = enrichTagTree(node.children, curPath, color, theme);
      if (count === undefined) {
        count = children.reduce((sum, child) => sum + (child.count || 0), 0);
      }
    }

    return {
      ...node,
      path: curPath,
      count: count !== undefined ? count : 1,
      color,
      theme,
      children,
    };
  });
}

const INITIAL_TAG_DATA = enrichTagTree(RAW_TAG_DATA);

// Helper to flatten ALL tags for keyword search (folders like North America are also tags!)
function getAllTags(nodes) {
  let list = [];
  nodes.forEach(node => {
    list.push(node);
    if (node.children) {
      list = list.concat(getAllTags(node.children));
    }
  });
  return list;
}

const ALL_TAGS = getAllTags(INITIAL_TAG_DATA);

const TagsPanel = ({ inboxName = 'Email 01', onBack, onSelectTag, onClearTag, activeTagId }) => {
  const [currentParent, setCurrentParent] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(activeTagId || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customTags, setCustomTags] = useState([]);
  const [openMenuTagId, setOpenMenuTagId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!openMenuTagId) return;
    const handleClose = () => setOpenMenuTagId(null);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [openMenuTagId]);

  const handleKebabClick = (tag, e) => {
    e.stopPropagation();
    if (openMenuTagId === tag.id) {
      setOpenMenuTagId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 90;
    const top = rect.bottom + dropdownHeight > window.innerHeight
      ? rect.top - dropdownHeight
      : rect.bottom + 4;
    setMenuPosition({
      top,
      left: Math.min(rect.left, window.innerWidth - 150),
    });
    setOpenMenuTagId(tag.id);
  };

  useEffect(() => {
    setSelectedTag(activeTagId || null);
  }, [activeTagId]);

  const handleSelect = (tag) => {
    setSelectedTag(tag.id);
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  const handleCreateTag = ({ name, color }) => {
    const newTag = {
      id: `custom_${Date.now()}`,
      name,
      color,
      count: 0,
      isFolder: false,
      path: currentParent ? [...(currentParent.path || [currentParent.name]), name] : [name],
    };
    setCustomTags(prev => [...prev, newTag]);
  };

  // Navigation handlers: drill down into folder AND apply filter
  const handleDrillInto = (folder) => {
    setBreadcrumbs(prev => [...prev, folder]);
    setCurrentParent(folder);
    handleSelect(folder);
  };

  const handleDrillBack = () => {
    if (breadcrumbs.length <= 1) {
      setBreadcrumbs([]);
      setCurrentParent(null);
      setSelectedTag(null);
      if (onClearTag) {
        onClearTag();
      }
    } else {
      const nextBreadcrumbs = breadcrumbs.slice(0, -1);
      const parent = nextBreadcrumbs[nextBreadcrumbs.length - 1];
      setBreadcrumbs(nextBreadcrumbs);
      setCurrentParent(parent);
      handleSelect(parent);
    }
  };

  // Filtered nodes based on search or current drilldown level
  const displayedNodes = useMemo(() => {
    const activeCustom = customTags.filter(t => {
      if (!currentParent) return t.path.length === 1;
      return t.path.length === currentParent.path.length + 1 &&
             t.path.slice(0, -1).join('/') === currentParent.path.join('/');
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return [...ALL_TAGS, ...customTags].filter(tag =>
        tag.name.toLowerCase().includes(q)
      );
    }
    const baseNodes = currentParent ? (currentParent.children || []) : INITIAL_TAG_DATA;
    return [...baseNodes, ...activeCustom];
  }, [searchQuery, currentParent, customTags]);

  // Back row label (e.g. '< Customers' or '< North America')
  const backLabel = useMemo(() => {
    if (!currentParent) return '';
    return currentParent.name;
  }, [currentParent]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="tags-panel-wrapper">
      {/* 1. Header (<- Conversations   [search] [+] [v]) */}
      <div className="tags-top-header">
        <div className="tags-header-back-group" onClick={onBack} title="Back to Conversations">
          <div className="tags-back-icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </div>
          <span className="tags-header-title">Conversations</span>
        </div>

        <div className="tags-header-actions">
          <button type="button" className="header-icon-btn" title="Search">
            <img src={searchIcon} alt="" width="16" height="16" />
          </button>
          <div className="new-convo-split-btn">
            <button type="button" className="split-btn-main" title="New conversation">
              <img src={plusIcon} alt="" width="16" height="16" />
            </button>
            <button type="button" className="split-btn-chevron" title="More options">
              <img src={chevronDownSmall} alt="" width="14" height="14" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-Header: {inboxName} / Tags  [+] */}
      <div className="tags-subheader-row">
        <div className="tags-breadcrumb-nav">
          <span className="tags-breadcrumb-prefix">{inboxName}</span>
          <span className="tags-breadcrumb-slash">/</span>
          <span className="tags-breadcrumb-current">Tags</span>
        </div>
        <button
          type="button"
          className="tags-add-icon-btn"
          title="Add Tag"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <img src={plusIcon} alt="" width="14" height="14" />
        </button>
      </div>

      {/* 3. Search Box */}
      <div className="tags-search-container">
        <div className="tags-search-input-wrap">
          <div className="tags-search-glass-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            className="tags-search-input"
            placeholder="Search Tags"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Tags List */}
      <div className="tags-list-scroll">
        {/* Drilldown Back Row */}
        {!isSearching && currentParent && (
          <div className="tags-drill-back-row" onClick={handleDrillBack}>
            <span className="tags-drill-back-arrow">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
            <span>{backLabel}</span>
          </div>
        )}

        {/* Empty state for search */}
        {isSearching && displayedNodes.length === 0 && (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--slateTextSubtle)', fontSize: '13px' }}>
            No matching tags found
          </div>
        )}

        {/* Render folders & tags */}
        {displayedNodes.map((item) => {
          if (item.isFolder && !isSearching) {
            return (
              <div
                key={item.id}
                className="tags-folder-item"
                onClick={() => handleDrillInto(item)}
              >
                <div className="tags-folder-item-left">
                  <span className="tags-indicator-bar" style={{ backgroundColor: item.color || '#1f93ff' }} />
                  <span className="tags-folder-label">{item.name}</span>
                </div>
                <span className="tags-chevron-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
            );
          }

          // Leaf Tag
          const isSelected = selectedTag === item.id;
          const hasSubtitle = isSearching && item.path && item.path.length > 1;
          const subtitlePath = hasSubtitle ? item.path.slice(0, -1).join(' / ') : null;
          const isNonNested = !item.isFolder && (!item.path || item.path.length <= 1);
          const isMenuOpen = openMenuTagId === item.id;

          return (
            <div
              key={item.id}
              className={`tags-leaf-item ${isSelected ? 'active' : ''} ${hasSubtitle ? 'has-subtitle' : ''} ${isMenuOpen ? 'menu-open' : ''}`}
              onClick={() => handleSelect(item)}
            >
              <div className="tags-leaf-item-left">
                <span className="tags-indicator-bar" style={{ backgroundColor: item.color || '#1f93ff' }} />
                <div className="tags-leaf-text-col">
                  <div className="tags-leaf-label">{item.name}</div>
                  {hasSubtitle && (
                    <div className="tags-search-path-hint" title={subtitlePath}>
                      {subtitlePath}
                    </div>
                  )}
                </div>
              </div>

              {isNonNested ? (
                <div className="tags-leaf-actions">
                  <span className="tags-leaf-count">{item.count}</span>
                  <button
                    type="button"
                    className={`tags-kebab-btn ${isMenuOpen ? 'active' : ''}`}
                    title="More options"
                    onClick={(e) => handleKebabClick(item, e)}
                  >
                    <img src={kebabMenuIcon} alt="" width="14" height="14" />
                  </button>
                </div>
              ) : (
                <span className="tags-leaf-count">{item.count}</span>
              )}
            </div>
          );
        })}
      </div>

      {openMenuTagId && (
        <div
          className="tags-kebab-dropdown"
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 999999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="tags-kebab-dropdown-item"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuTagId(null);
            }}
          >
            <img src={editSignIcon} alt="" width="14" height="14" className="tags-kebab-dropdown-icon" />
            <span>Edit</span>
          </div>
          <div
            className="tags-kebab-dropdown-item"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuTagId(null);
            }}
          >
            <img src={deleteSignIcon} alt="" width="14" height="14" className="tags-kebab-dropdown-icon" />
            <span>Delete</span>
          </div>
        </div>
      )}

      <CreateTagModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTag}
      />
    </div>
  );
};

export default TagsPanel;
